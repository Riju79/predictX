import { rpc, Account, TransactionBuilder, Networks, Operation, Keypair, Address, Contract, scValToNative, nativeToScVal, xdr } from '@stellar/stellar-sdk';
import { execSync } from 'child_process';

async function main() {
  const server = new rpc.Server('https://mainnet.sorobanrpc.com');
  const secretKey = execSync('stellar keys show deployer-mainnet').toString().trim();
  const keypair = Keypair.fromSecret(secretKey);

  const marketId = 'CCXHGNQRUJMONANKBM3JCYOHHO2Z4BJHOU2GXH72ORNSEG4CRUSKRC4V';
  const marketContract = new Contract(marketId);

  const user = new Address('GACY34BGOUKJIT25Q3V6QHISDFEYD67GJUMFIC7LD74ATOYNN4VBBZLA');
  const testMarketId = 1n;
  const amount = 500_000n; // 0.05 XLM

  console.log('--- PHASE 8: REMOVE LIQUIDITY SIMULATION & SUBMISSION ---');
  const horizonRaw = execSync(`curl -s "https://horizon.stellar.org/accounts/${keypair.publicKey()}"`).toString();
  const accData = JSON.parse(horizonRaw);
  const account = new Account(keypair.publicKey(), accData.sequence);

  let tx = new TransactionBuilder(account, { fee: '100', networkPassphrase: Networks.PUBLIC })
    .addOperation(marketContract.call('remove_liquidity', user.toScVal(), nativeToScVal(testMarketId, { type: 'u64' }), nativeToScVal(amount, { type: 'i128' })))
    .setTimeout(180)
    .build();

  tx = await server.prepareTransaction(tx);
  const feePaid = Number(tx.fee) / 1e7;
  console.log('Prepared remove_liquidity Tx Fee (XLM):', feePaid);

  tx.sign(keypair);
  console.log('Submitting remove_liquidity transaction to Stellar Mainnet...');
  const sendRes = await server.sendTransaction(tx);
  console.log('Send Result Status:', sendRes.status, 'Hash:', sendRes.hash);

  if (sendRes.status === 'PENDING') {
    let getRes = await server.getTransaction(sendRes.hash);
    while (getRes.status === 'NOT_FOUND') {
      await new Promise(r => setTimeout(r, 1000));
      getRes = await server.getTransaction(sendRes.hash);
    }
    console.log('🎉 REMOVE_LIQUIDITY TRANSACTION STATUS:', getRes.status);
    console.log('REMOVE_LIQUIDITY_TX_HASH:', sendRes.hash);
  }
}

main().catch(console.error);
