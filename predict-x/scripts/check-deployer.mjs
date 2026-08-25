import { Horizon } from '@stellar/stellar-sdk';

const DEPLOYER_PK = 'GACY34BGOUKJIT25Q3V6QHISDFEYD67GJUMFIC7LD74ATOYNN4VBBZLA';

async function main() {
  const server = new Horizon.Server('https://horizon.stellar.org');
  const account = await server.loadAccount(DEPLOYER_PK);
  const native = account.balances.find(b => b.asset_type === 'native');
  console.log('Deployer Account:', DEPLOYER_PK);
  console.log('Deployer XLM Balance:', native ? native.balance : '0', 'XLM');
}

main().catch(console.error);
