import { rpc, Address, xdr } from '@stellar/stellar-sdk';

const RPC_URL = 'https://mainnet.sorobanrpc.com';
const CONTRACT_ID = 'CBGM366XLWT3S34X5YY4RIT7YIK3OBEZLEMLAQOAQH77TNA5FY6RTITL';

async function main() {
  console.log(`Inspecting contract ${CONTRACT_ID} on Stellar Mainnet...`);
  const server = new rpc.Server(RPC_URL);

  const address = new Address(CONTRACT_ID);
  
  const key = xdr.LedgerKey.contractData(new xdr.LedgerKeyContractData({
    contract: address.toScAddress(),
    key: xdr.ScVal.scvLedgerKeyContractInstance(),
    durability: xdr.ContractDataDurability.persistent(),
  }));

  const res = await server.getLedgerEntries(key);
  const entry = res.entries[0];
  const val = entry.val.contractData().val();
  const instance = val.instance();
  const wasmHash = instance.executable().wasmHash().toString('hex');
  console.log('Executable WASM Hash on Mainnet:', wasmHash);

  const codeKey = xdr.LedgerKey.contractCode(new xdr.LedgerKeyContractCode({
    hash: Buffer.from(wasmHash, 'hex'),
  }));

  const codeRes = await server.getLedgerEntries(codeKey);
  const codeBytes = codeRes.entries[0].val.contractCode().code();

  // Parse ContractSpec entries from WASM bytecode custom section
  // Look for contract spec entries in WASM
  const wasmBuf = Buffer.from(codeBytes);
  console.log('WASM Bytecode Total Length:', wasmBuf.length);

  // Search for string function names in WASM binary
  const fnNames = ['create_market', 'buy_shares', 'sell_shares', 'add_liquidity', 'remove_liquidity', 'get_market_state', 'initialize'];
  for (const fn of fnNames) {
    const idx = wasmBuf.indexOf(Buffer.from(fn));
    console.log(`Function '${fn}' found at byte offset:`, idx >= 0 ? idx : 'NOT FOUND');
  }
}

main().catch(err => console.error(err));
