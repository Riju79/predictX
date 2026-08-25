import { rpc, Address, xdr, scValToNative } from '@stellar/stellar-sdk';

const RPC_URL = 'https://mainnet.sorobanrpc.com';
const FACTORY_ID = 'CBGM366XLWT3S34X5YY4RIT7YIK3OBEZLEMLAQOAQH77TNA5FY6RTITL';

async function main() {
  console.log(`Inspecting Factory Instance Storage...`);
  const server = new rpc.Server(RPC_URL);

  const address = new Address(FACTORY_ID);
  const key = xdr.LedgerKey.contractData(new xdr.LedgerKeyContractData({
    contract: address.toScAddress(),
    key: xdr.ScVal.scvLedgerKeyContractInstance(),
    durability: xdr.ContractDataDurability.persistent(),
  }));

  const res = await server.getLedgerEntries(key);
  const entry = res.entries[0];
  const instance = entry.val.contractData().val().instance();
  const storage = instance.storage();

  for (let i = 0; i < storage.length; i++) {
    const item = storage[i];
    const itemKey = scValToNative(item.key());
    const itemVal = scValToNative(item.val());
    console.log(`Storage Entry [${i}]:`);
    console.log(' - Key:', itemKey);
    console.log(' - Val:', itemVal);
  }
}

main().catch(console.error);
