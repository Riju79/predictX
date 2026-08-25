import { rpc, Address, xdr, Contract, TransactionBuilder, Account } from '@stellar/stellar-sdk';
import { Client as FactoryClient } from '../src/bindings/factory.ts';

const RPC_URL = 'https://mainnet.sorobanrpc.com';
const FACTORY_ID = 'CBGM366XLWT3S34X5YY4RIT7YIK3OBEZLEMLAQOAQH77TNA5FY6RTITL';
const ORACLE_ID = 'CC2NCXWMJTVYYICPIZK422RGNDZSSA4YENZCTGNAZQBWMSGQK7SWAFKZ';
const TEST_USER = 'GCV75VKMHKEUBMB4NXHH7DZIWS2ROEHY4E5Q7BAR7AJ5RRN7WTTSVJT7';

async function main() {
  const server = new rpc.Server(RPC_URL);
  const factoryClient = new FactoryClient({
    contractId: FACTORY_ID,
    rpcUrl: RPC_URL,
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    publicKey: TEST_USER,
  });

  const question = 'Fulham_vs_Chelsea';
  const expirationTime = BigInt(Math.floor(Date.now() / 1000) + 86400 * 30);

  const assembledTx = await factoryClient.create_market({
    creator: TEST_USER,
    question,
    resolution_time: expirationTime,
    oracle_id: ORACLE_ID,
  });

  console.log('Simulation Raw Result:');
  console.log(JSON.stringify(assembledTx.simulation, null, 2));
}

main().catch(console.error);
