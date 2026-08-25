import { rpc, Address, xdr, Operation, TransactionBuilder, Account } from '@stellar/stellar-sdk';

const RPC_URL = 'https://mainnet.sorobanrpc.com';
const FACTORY_ID = 'CBGM366XLWT3S34X5YY4RIT7YIK3OBEZLEMLAQOAQH77TNA5FY6RTITL';
const ORACLE_ID = 'CC2NCXWMJTVYYICPIZK422RGNDZSSA4YENZCTGNAZQBWMSGQK7SWAFKZ';
const TEST_USER = 'GCV75VKMHKEUBMB4NXHH7DZIWS2ROEHY4E5Q7BAR7AJ5RRN7WTTSVJT7';

async function main() {
  console.log('Testing rpcServer.prepareTransaction for Soroban Contract Invocation...');
  const server = new rpc.Server(RPC_URL);

  const question = 'Fulham_vs_Chelsea';
  const expirationTime = BigInt(Math.floor(Date.now() / 1000) + 86400 * 30);

  const scValArgs = [
    new Address(TEST_USER).toScVal(),
    xdr.ScVal.scvSymbol(question),
    xdr.ScVal.scvU64(new xdr.Uint64(expirationTime)),
    new Address(ORACLE_ID).toScVal(),
  ];

  const operation = Operation.invokeContractFunction({
    contract: FACTORY_ID,
    function: 'create_market',
    args: scValArgs,
  });

  const accountRes = await server.getAccount(TEST_USER);
  const account = new Account(TEST_USER, accountRes.sequence.toString());

  const tx = new TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
  })
    .addOperation(operation)
    .setTimeout(180)
    .build();

  console.log('Building raw transaction XDR...');

  try {
    console.log('Simulating and preparing transaction via Soroban RPC...');
    const preparedTx = await server.prepareTransaction(tx);
    console.log('✅ Transaction Prepared Successfully!');
    console.log('Prepared XDR:', preparedTx.toXDR());
  } catch (err) {
    console.error('❌ Prepare Transaction Error:', err.message || err);
  }
}

main().catch(console.error);
