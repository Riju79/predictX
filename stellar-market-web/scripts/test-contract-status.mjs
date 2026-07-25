import { Server, xdr, Address } from "@stellar/stellar-sdk";
import { Client as FactoryClient } from "../src/bindings/factory.js";
import { Client as MarketClient } from "../src/bindings/market.js";

const rpcUrl = "https://soroban-testnet.stellar.org";
const networkPassphrase = "Test SDF Network ; September 2015";

const contracts = {
  factory: "CAH7OM5SZSFF5NJO7IMLLVI2TJKZMIE5E7ZLSILMKAMWVFMCENDKKFYQ",
  market: "CAP5UKEGIW2SIUQIFR6VQ7665EHAJ4E47ORTFW52VRKBSZQYP47UFTRM",
  oracle: "CBVFQ4A4J7U2X6ZZBJE6MN5L2DJG4M7VBIG3MXV2XH4KQ2UNMNEGIGR5",
  amm: "CCWT35G2TPYBPDIHD5A4HKY2VOORJ55JPV4YEPJRAKKJZCP7F5LOZASS",
  token: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
};

async function test() {
  console.log("Checking Soroban Testnet Contract Status...");
  const server = new Server(rpcUrl);
  const latestLedger = await server.getLatestLedger();
  console.log("Latest Testnet Ledger Sequence:", latestLedger.sequence);

  try {
    const factoryClient = new FactoryClient({
      contractId: contracts.factory,
      rpcUrl,
      networkPassphrase
    });
    console.log("Testing factory list_markets simulation...");
    const tx = await factoryClient.list_markets();
    console.log("list_markets simulation result:", tx.result);
  } catch (e) {
    console.log("Factory list_markets error:", e.message || e);
  }

  try {
    const marketClient = new MarketClient({
      contractId: contracts.market,
      rpcUrl,
      networkPassphrase
    });
    console.log("Testing market get_market_state simulation for ID 1...");
    const tx = await marketClient.get_market_state({ market_id: 1n });
    console.log("get_market_state simulation result:", tx.result);
  } catch (e) {
    console.log("Market get_market_state error:", e.message || e);
  }
}

test();
