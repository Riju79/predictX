import { rpc, Account, TransactionBuilder, Networks, Operation, Keypair, Address, Contract, scValToNative, nativeToScVal, xdr } from '@stellar/stellar-sdk';
import { execSync } from 'child_process';

async function main() {
  const server = new rpc.Server('https://mainnet.sorobanrpc.com');
  const secretKey = execSync('stellar keys show deployer-mainnet').toString().trim();
  const keypair = Keypair.fromSecret(secretKey);

  const factoryId = 'CCA73ZYKH5BB4EVVPVJJNJJV6ALY6DG3FGCNCJMEUA6VJTBNVRGEWBMH';
  const factoryContract = new Contract(factoryId);

  const creator = new Address('GACY34BGOUKJIT25Q3V6QHISDFEYD67GJUMFIC7LD74ATOYNN4VBBZLA');
  const oracle = new Address('CC2NCXWMJTVYYICPIZK422RGNDZSSA4YENZCTGNAZQBWMSGQK7SWAFKZ');
  const questionSymbol = xdr.ScVal.scvSymbol('will_btc_reach_100k');
  const resTime = 1790597456n;

  console.log('--- PHASE 6: CREATE MARKET SIMULATION & SUBMISSION ---');
  const horizonRaw = execSync(`curl -s "https://horizon.stellar.org/accounts/${keypair.publicKey()}"`).toString();
  const accData = JSON.parse(horizonRaw);
  const account = new Account(keypair.publicKey(), accData.sequence);

  let tx = new TransactionBuilder(account, { fee: '100', networkPassphrase: Networks.PUBLIC })
    .addOperation(factoryContract.call('create_market', creator.toScVal(), questionSymbol, nativeToScVal(resTime, { type: 'u64' }), oracle.toScVal()))
    .setTimeout(180)
    .build();

  tx = await server.prepareTransaction(tx);
  const feePaid = Number(tx.fee) / 1e7;
  console.log('Prepared create_market Tx Fee (XLM):', feePaid);

  tx.sign(keypair);
  console.log('Submitting create_market transaction to Stellar Mainnet...');
  const sendRes = await server.sendTransaction(tx);
  console.log('Send Result Status:', sendRes.status, 'Hash:', sendRes.hash);

  if (sendRes.status === 'PENDING') {
    let getRes = await server.getTransaction(sendRes.hash);
    while (getRes.status === 'NOT_FOUND') {
      await new Promise(r => setTimeout(r, 1000));
      getRes = await server.getTransaction(sendRes.hash);
    }
    console.log('🎉 CREATE_MARKET TRANSACTION STATUS:', getRes.status);
    console.log('CREATE_MARKET_TX_HASH:', sendRes.hash);
    if ('returnValue' in getRes && getRes.returnValue) {
      const createdMarketId = scValToNative(getRes.returnValue as any);
      console.log('🎉 TEST_MARKET_ID:', createdMarketId.toString());
    }
  }
}

main().catch(console.error);
