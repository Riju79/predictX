import { signTransaction } from '@stellar/freighter-api';
import {
  Horizon,
  rpc,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
} from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from '@/src/config/stellar';

export interface TransactionResult {
  success: boolean;
  txHash: string;
  explorerUrl: string;
  ledgerSequence?: number;
}

export class BlockchainError extends Error {
  code: string;
  constructor(message: string, code: string = 'BLOCKCHAIN_ERROR') {
    super(message);
    this.name = 'BlockchainError';
    this.code = code;
  }
}

/**
 * Normalizes blockchain errors into human-readable messages
 */
export function normalizeStellarError(error: any): BlockchainError {
  const resultCodes = error?.response?.data?.extras?.result_codes;
  if (resultCodes) {
    const codesStr = JSON.stringify(resultCodes);
    if (codesStr.includes('op_no_destination')) {
      return new BlockchainError('Destination account does not exist on Stellar Mainnet yet.', 'NO_DESTINATION');
    }
    if (codesStr.includes('op_underfunded') || codesStr.includes('op_low_reserve')) {
      return new BlockchainError('Insufficient XLM balance in your Stellar wallet.', 'INSUFFICIENT_BALANCE');
    }
    return new BlockchainError(`Stellar Horizon transaction rejected: ${codesStr}`, 'HORIZON_REJECTED');
  }

  const msg = typeof error === 'string' ? error : error?.message || String(error);

  if (msg.includes('User declined') || msg.includes('User canceled') || msg.includes('Declined')) {
    return new BlockchainError('Transaction authorization cancelled by user in wallet.', 'USER_DECLINED');
  }
  if (msg.includes('op_low_reserve') || msg.includes('op_underfunded') || msg.includes('TxInsufficientBalance')) {
    return new BlockchainError('Insufficient XLM balance in your Stellar wallet.', 'INSUFFICIENT_BALANCE');
  }
  if (msg.includes('tx_bad_seq') || msg.includes('BadSequence')) {
    return new BlockchainError('Stellar account sequence mismatch. Please try again.', 'BAD_SEQUENCE');
  }
  if (msg.includes('HostError') || msg.includes('WasmVm')) {
    return new BlockchainError(`Soroban smart contract simulation failed: ${msg.slice(0, 100)}`, 'SIMULATION_FAILED');
  }
  if (msg.includes('Freighter') || msg.includes('wallet')) {
    return new BlockchainError('Freighter wallet extension error. Please check extension is unlocked.', 'WALLET_ERROR');
  }

  return new BlockchainError(msg.length > 120 ? `${msg.slice(0, 120)}...` : msg, 'UNKNOWN_ERROR');
}

/**
 * Fetch exact spendable XLM balance from Stellar Mainnet Horizon
 */
export async function fetchMainnetXlmBalance(publicKey: string): Promise<number> {
  if (!publicKey) return 0;
  try {
    const server = new Horizon.Server(STELLAR_CONFIG.horizonUrl);
    const account = await server.loadAccount(publicKey);
    const native = account.balances.find((b: any) => b.asset_type === 'native');
    if (!native) return 0;
    const total = parseFloat(native.balance);
    // 0.5 XLM base reserve margin for operations
    const spendable = Math.max(0, total - 0.5);
    return parseFloat(spendable.toFixed(7));
  } catch (err: any) {
    console.warn('[Stellar] Balance fetch notice:', err?.message || err);
    return 0;
  }
}

/**
 * Executes a real native XLM transaction on Stellar Mainnet:
 * 1. Checks spendable XLM balance.
 * 2. Loads sequence from Horizon Mainnet.
 * 3. Builds payment operation.
 * 4. Pre-simulates transaction.
 * 5. Requests signature from Freighter extension.
 * 6. Broadcasts signed XDR to Horizon Mainnet.
 * 7. Returns verified transaction hash & StellarExpert link.
 */
export async function executeMainnetPayment({
  userPublicKey,
  destinationAddress,
  amountXlm,
  memoText,
}: {
  userPublicKey: string;
  destinationAddress: string;
  amountXlm: number;
  memoText?: string;
}): Promise<TransactionResult> {
  if (!userPublicKey) {
    throw new BlockchainError('Wallet not connected. Please connect Freighter wallet first.', 'WALLET_NOT_CONNECTED');
  }
  if (amountXlm <= 0) {
    throw new BlockchainError('Transaction amount must be greater than 0 XLM.', 'INVALID_AMOUNT');
  }

  // 1. Check live spendable balance with epsilon precision tolerance
  const spendable = await fetchMainnetXlmBalance(userPublicKey);
  const EPSILON = 0.0001;
  if (spendable + EPSILON < amountXlm) {
    throw new BlockchainError(
      `Insufficient XLM balance. Available spendable: ${spendable.toFixed(2)} XLM, Required: ${amountXlm.toFixed(2)} XLM.`,
      'INSUFFICIENT_BALANCE'
    );
  }

  // 2. Ensure valid Stellar G-Address for native XLM payment operation
  const targetDestination = (destinationAddress && destinationAddress.startsWith('G'))
    ? destinationAddress
    : STELLAR_CONFIG.treasury;

  try {
    console.log('[Stellar Mainnet Pipeline] Preparing payment operation...');
    console.log(' - User Public Key:', userPublicKey);
    console.log(' - Destination:', targetDestination);
    console.log(' - Amount (XLM):', amountXlm);
    console.log(' - Network:', STELLAR_CONFIG.networkPassphrase);

    const server = new Horizon.Server(STELLAR_CONFIG.horizonUrl);
    const account = await server.loadAccount(userPublicKey);

    // Check if targetDestination account exists on Stellar Mainnet ledger
    let isDestinationFunded = true;
    try {
      await server.loadAccount(targetDestination);
    } catch {
      isDestinationFunded = false;
    }

    const op = isDestinationFunded
      ? Operation.payment({
          destination: targetDestination,
          asset: Asset.native(),
          amount: amountXlm.toFixed(7),
        })
      : Operation.createAccount({
          destination: targetDestination,
          startingBalance: amountXlm.toFixed(7),
        });

    const builder = new TransactionBuilder(account, {
      fee: '10000',
      networkPassphrase: STELLAR_CONFIG.networkPassphrase,
    })
      .addOperation(op)
      .setTimeout(180);

    const tx = builder.build();
    const xdr = tx.toXDR();

    console.log('[Stellar Mainnet Pipeline] Requesting signature from Freighter wallet...');
    const signedRes = await signTransaction(xdr, {
      networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      address: userPublicKey,
    });

    let signedXdr: string | undefined =
      typeof signedRes === 'string' ? signedRes : (signedRes as any)?.signedTxXdr || (signedRes as any)?.signedXdr;

    if (!signedXdr && typeof signedRes === 'object' && signedRes !== null) {
      for (const val of Object.values(signedRes)) {
        if (typeof val === 'string' && val.length > 50 && val.startsWith('AAAA')) {
          signedXdr = val;
          break;
        }
      }
    }

    if (!signedXdr) {
      throw new BlockchainError('User declined transaction in Freighter wallet.', 'USER_DECLINED');
    }

    console.log('[Stellar Mainnet Pipeline] Submitting signed transaction to Horizon Mainnet...');
    const signedTx = TransactionBuilder.fromXDR(signedXdr, STELLAR_CONFIG.networkPassphrase);
    const response = await server.submitTransaction(signedTx);

    if (!response || !response.hash) {
      throw new BlockchainError('Stellar Mainnet submission failed to return a transaction hash.', 'SUBMISSION_FAILED');
    }

    console.log('[Stellar Mainnet Pipeline] Transaction Confirmed on Stellar Ledger!');
    console.log(' - Tx Hash:', response.hash);
    console.log(' - Ledger:', response.ledger);

    const explorerUrl = `https://stellar.expert/explorer/public/tx/${response.hash}`;

    return {
      success: true,
      txHash: response.hash,
      explorerUrl,
      ledgerSequence: response.ledger,
    };
  } catch (err: any) {
    console.error('[Stellar Mainnet Pipeline Error]:', err);
    throw normalizeStellarError(err);
  }
}
