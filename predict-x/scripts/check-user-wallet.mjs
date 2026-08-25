import { Horizon } from '@stellar/stellar-sdk';

const USER_PK = 'GCV75VKMHKEUBMB4NXHH7DZIWS2ROEHY4E5Q7BAR7AJ5RRN7WTTSVJT7';

async function main() {
  const server = new Horizon.Server('https://horizon.stellar.org');
  const account = await server.loadAccount(USER_PK);
  const native = account.balances.find(b => b.asset_type === 'native');
  console.log('User Wallet 2 Account:', USER_PK);
  console.log('User Wallet 2 XLM Balance:', native ? native.balance : '0', 'XLM');
}

main().catch(console.error);
