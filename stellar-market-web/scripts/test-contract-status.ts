import { rpc, Contract, scValToNative, xdr, TransactionBuilder, Account, Address } from "@stellar/stellar-sdk";

const rpcUrl = "https://soroban-testnet.stellar.org";
const marketContractId = "CAP5UKEGIW2SIUQIFR6VQ7665EHAJ4E47ORTFW52VRKBSZQYP47UFTRM";

async function test() {
  console.log("Testing add_liquidity simulation for Market ID 1...");
  const server = new rpc.Server(rpcUrl);
  const contract = new Contract(marketContractId);

  const userAddr = Address.fromString("GD5KLSM2KUTL3VO34BP5S3LG3HMUE2DKERMSEQDOPR5JPHW2UTMPMAK5");

  try {
    const tx = contract.call(
      "add_liquidity",
      userAddr.toScVal(),
      xdr.ScVal.scvU64(new xdr.Uint64(1n)),
      xdr.ScVal.scvI128(new xdr.Int128Parts({ lo: new xdr.Uint64(50_000_000n), hi: new xdr.Int64(0n) }))
    );

    const sim = await server.simulateTransaction(
      new TransactionBuilder(
        new Account("GD5KLSM2KUTL3VO34BP5S3LG3HMUE2DKERMSEQDOPR5JPHW2UTMPMAK5", "100"),
        { fee: "100", networkPassphrase: "Test SDF Network ; September 2015" }
      ).addOperation(tx).setTimeout(30).build()
    );

    if (rpc.Api.isSimulationSuccess(sim) && sim.result) {
      console.log("ADD_LIQUIDITY SUCCESS! New LP Position:", scValToNative(sim.result.retval));
    } else {
      console.log("ADD_LIQUIDITY FAILED:", sim);
    }
  } catch (e: any) {
    console.log("Add Liquidity Error:", e.message || e);
  }
}

test();
