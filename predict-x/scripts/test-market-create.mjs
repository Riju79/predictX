

import { rpc, Address, xdr, Contract } from '@stellar/stellar-sdk';
import { Client as MarketClient } from '../src/bindings/market.ts';

const RPC_URL = 'https://mainnet.sorobanrpc.com';
const MARKET_ID = 'CBGM366XLWT3S34X5YY4RIT7YIK3OBEZLEMLAQOAQH77TNA5FY6RTITL';
const ORACLE_ID = 'CC2NCXWMJTVYYICPIZK422RGNDZSSA4YENZCTGNAZQBWMSGQK7SWAFKZ';
const TEST_USER = 'GCV75VKMHKEUBMB4NXHH7DZIWS2ROEHY4E5Q7BAR7AJ5RRN7WTTSVJT7';

async function main() {
  console.log(`Testing marketClient.create_market simulation on Mainnet...`);
  
  const client = new MarketClient({
    contractId: MARKET_ID,
    rpcUrl: RPC_URL,
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    publicKey: TEST_USER,
  });

  const nextNumericId = BigInt(Math.floor(Math.random() * 900000) + 100000);
  const resolutionTime = BigInt(Math.floor(Date.now() / 1000) + 86400 * 30);

  console.log('Parameters:');
  console.log(' - creator:', TEST_USER);
  console.log(' - market_id:', nextNumericId.toString());
  console.log(' - resolution_time:', resolutionTime.toString());
  console.log(' - oracle_id:', ORACLE_ID);

  try {
    const tx = await client.create_market({
      creator: TEST_USER,
      market_id: nextNumericId,
      resolution_time: resolutionTime,
      oracle_id: ORACLE_ID,
    });

    console.log('Simulation Success! Assembled Transaction built cleanly.');
    console.log('Simulation Result:', JSON.stringify(tx.simulation, null, 2));
  } catch (err) {
    console.error('Simulation Error:', err);
  }
}

main().catch(console.error);
