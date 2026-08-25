import { rpc, Address, xdr } from '@stellar/stellar-sdk';
import { Spec as ContractSpec } from '@stellar/stellar-sdk/contract';

const RPC_URL = 'https://mainnet.sorobanrpc.com';
const contracts = {
  factory: 'CBGM366XLWT3S34X5YY4RIT7YIK3OBEZLEMLAQOAQH77TNA5FY6RTITL',
  oracle: 'CC2NCXWMJTVYYICPIZK422RGNDZSSA4YENZCTGNAZQBWMSGQK7SWAFKZ',
  amm: 'CDPPM2LRO3RRO3TGP7NYTWPD2EPEJIJ6S6QHESMZCC5LSOPAZJRFCDZO',
  token: 'CAS3J5D3AEVFD4BLTC3C55EEB5EBQX3TDKQL6Y2RME6F74D5EE6UY63E',
};

async function inspectContract(name, contractId) {
  console.log(`\n========================================================`);
  console.log(`🔍 Inspecting ${name.toUpperCase()} (${contractId}) on Mainnet...`);
  const server = new rpc.Server(RPC_URL);

  try {
    const address = new Address(contractId);
    const key = xdr.LedgerKey.contractData(new xdr.LedgerKeyContractData({
      contract: address.toScAddress(),
      key: xdr.ScVal.scvLedgerKeyContractInstance(),
      durability: xdr.ContractDataDurability.persistent(),
    }));

    const res = await server.getLedgerEntries(key);
    if (!res.entries || res.entries.length === 0) {
      console.log(`❌ Ledger entry not found for ${contractId}`);
      return;
    }

    const entry = res.entries[0];
    const val = entry.val.contractData().val();
    const instance = val.instance();
    const wasmHash = instance.executable().wasmHash().toString('hex');
    console.log(`✅ WASM Hash: ${wasmHash}`);

    // Fetch code entry
    const codeKey = xdr.LedgerKey.contractCode(new xdr.LedgerKeyContractCode({
      hash: Buffer.from(wasmHash, 'hex'),
    }));
    const codeRes = await server.getLedgerEntries(codeKey);
    if (codeRes.entries && codeRes.entries.length > 0) {
      const codeBytes = codeRes.entries[0].val.contractCode().code();
      console.log(`📦 WASM Bytecode Size: ${codeBytes.length} bytes`);
      
      // Parse contract spec entries from WASM or instance storage
      const storage = instance.storage();
      if (storage) {
        console.log(`💾 Instance Storage Entries: ${storage.length}`);
        for (const item of storage) {
          try {
            console.log(`   - Key:`, item.key().switch().name, `Val:`, item.val().switch().name);
          } catch {}
        }
      }
    }
  } catch (err) {
    console.error(`❌ Error inspecting ${name}:`, err.message);
  }
}

async function main() {
  for (const [name, id] of Object.entries(contracts)) {
    await inspectContract(name, id);
  }
}

main().catch(console.error);
