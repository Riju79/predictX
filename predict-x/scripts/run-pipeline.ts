import { rpc, Account, TransactionBuilder, Networks, Operation, Keypair, Address, Contract, scValToNative, nativeToScVal } from '@stellar/stellar-sdk';
import { execSync } from 'child_process';

async function main() {
  const server = new rpc.Server('https://mainnet.sorobanrpc.com');
  const secretKey = execSync('stellar keys show deployer-mainnet').toString().trim();
  const keypair = Keypair.fromSecret(secretKey);

  const marketId = 'CCXHGNQRUJMONANKBM3JCYOHHO2Z4BJHOU2GXH72ORNSEG4CRUSKRC4V';
  const factoryId = 'CCA73ZYKH5BB4EVVPVJJNJJV6ALY6DG3FGCNCJMEUA6VJTBNVRGEWBMH';

  const admin = new Address('GACY34BGOUKJIT25Q3V6QHISDFEYD67GJUMFIC7LD74ATOYNN4VBBZLA');
  const token = new Address('CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA');
  const factory = new Address(factoryId);
  const treasury = new Address('GACY34BGOUKJIT25Q3V6QHISDFEYD67GJUMFIC7LD74ATOYNN4VBBZLA');
  const market = new Address(marketId);

  // 1. Initialize Market
  console.log('--- PHASE 3: INITIALIZE NEW_MARKET ---');
  const horizonRaw = execSync(`curl -s "https://horizon.stellar.org/accounts/${keypair.publicKey()}"`).toString();
  const accData = JSON.parse(horizonRaw);
  let account = new Account(keypair.publicKey(), accData.sequence);

  const marketContract = new Contract(marketId);
  let mTx = new TransactionBuilder(account, { fee: '100', networkPassphrase: Networks.PUBLIC })
    .addOperation(marketContract.call('initialize', admin.toScVal(), token.toScVal(), factory.toScVal(), treasury.toScVal()))
    .setTimeout(180)
    .build();

  mTx = await server.prepareTransaction(mTx);
  console.log('Prepared Market Init Tx Fee (XLM):', Number(mTx.fee) / 1e7);
  mTx.sign(keypair);

  const mSendRes = await server.sendTransaction(mTx);
  console.log('Market Init Send Status:', mSendRes.status, 'Hash:', mSendRes.hash);

  if (mSendRes.status === 'PENDING') {
    let getRes = await server.getTransaction(mSendRes.hash);
    while (getRes.status === 'NOT_FOUND') {
      await new Promise(r => setTimeout(r, 1000));
      getRes = await server.getTransaction(mSendRes.hash);
    }
    console.log('🎉 MARKET INIT STATUS:', getRes.status);
    console.log('NEW_MARKET_INIT_TX_HASH:', mSendRes.hash);
  }

  // 2. Initialize Factory
  console.log('\n--- PHASE 4: INITIALIZE NEW_FACTORY ---');
  const horizonRaw2 = execSync(`curl -s "https://horizon.stellar.org/accounts/${keypair.publicKey()}"`).toString();
  const accData2 = JSON.parse(horizonRaw2);
  account = new Account(keypair.publicKey(), accData2.sequence);

  const factoryContract = new Contract(factoryId);
  let fTx = new TransactionBuilder(account, { fee: '100', networkPassphrase: Networks.PUBLIC })
    .addOperation(factoryContract.call('initialize', market.toScVal()))
    .setTimeout(180)
    .build();

  fTx = await server.prepareTransaction(fTx);
  console.log('Prepared Factory Init Tx Fee (XLM):', Number(fTx.fee) / 1e7);
  fTx.sign(keypair);

  const fSendRes = await server.sendTransaction(fTx);
  console.log('Factory Init Send Status:', fSendRes.status, 'Hash:', fSendRes.hash);

  if (fSendRes.status === 'PENDING') {
    let getRes = await server.getTransaction(fSendRes.hash);
    while (getRes.status === 'NOT_FOUND') {
      await new Promise(r => setTimeout(r, 1000));
      getRes = await server.getTransaction(fSendRes.hash);
    }
    console.log('🎉 FACTORY INIT STATUS:', getRes.status);
    console.log('NEW_FACTORY_INIT_TX_HASH:', fSendRes.hash);
  }
}

main().catch(console.error);
