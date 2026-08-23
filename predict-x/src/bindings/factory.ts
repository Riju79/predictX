import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}




export type DataKey = {tag: "MarketContract", values: void} | {tag: "MarketCounter", values: void} | {tag: "Market", values: readonly [u64]} | {tag: "MarketList", values: void};


export interface MarketMeta {
  creator: string;
  id: u64;
  oracle_id: string;
  question: string;
  resolution_time: u64;
  resolved: boolean;
  winning_outcome: Option<u32>;
}

export interface Client {
  /**
   * Construct and simulate a get_market transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Read-only getter to fetch market metadata by market_id
   */
  get_market: ({market_id}: {market_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<MarketMeta>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the factory with the core market contract address
   */
  initialize: ({market_contract}: {market_contract: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a list_markets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Read-only getter to list all market IDs
   */
  list_markets: (options?: MethodOptions) => Promise<AssembledTransaction<Array<u64>>>

  /**
   * Construct and simulate a create_market transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Creates a new prediction market. Anyone can call this.
   * Triggers downstream contract creation/initialization on the market contract.
   * Returns the newly generated market_id.
   */
  create_market: ({creator, question, resolution_time, oracle_id}: {creator: string, question: string, resolution_time: u64, oracle_id: string}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAAAAAAAAAAADk1hcmtldENvbnRyYWN0AAAAAAAAAAAAAAAAAA1NYXJrZXRDb3VudGVyAAAAAAAAAQAAAAAAAAAGTWFya2V0AAAAAAABAAAABgAAAAAAAAAAAAAACk1hcmtldExpc3QAAA==",
        "AAAAAQAAAAAAAAAAAAAACk1hcmtldE1ldGEAAAAAAAcAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAACaWQAAAAAAAYAAAAAAAAACW9yYWNsZV9pZAAAAAAAABMAAAAAAAAACHF1ZXN0aW9uAAAAEQAAAAAAAAAPcmVzb2x1dGlvbl90aW1lAAAAAAYAAAAAAAAACHJlc29sdmVkAAAAAQAAAAAAAAAPd2lubmluZ19vdXRjb21lAAAAA+gAAAAE",
        "AAAAAAAAADZSZWFkLW9ubHkgZ2V0dGVyIHRvIGZldGNoIG1hcmtldCBtZXRhZGF0YSBieSBtYXJrZXRfaWQAAAAAAApnZXRfbWFya2V0AAAAAAABAAAAAAAAAAltYXJrZXRfaWQAAAAAAAAGAAAAAQAAB9AAAAAKTWFya2V0TWV0YQAA",
        "AAAAAAAAADxJbml0aWFsaXplIHRoZSBmYWN0b3J5IHdpdGggdGhlIGNvcmUgbWFya2V0IGNvbnRyYWN0IGFkZHJlc3MAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAPbWFya2V0X2NvbnRyYWN0AAAAABMAAAAA",
        "AAAAAAAAACdSZWFkLW9ubHkgZ2V0dGVyIHRvIGxpc3QgYWxsIG1hcmtldCBJRHMAAAAADGxpc3RfbWFya2V0cwAAAAAAAAABAAAD6gAAAAY=",
        "AAAAAAAAAKpDcmVhdGVzIGEgbmV3IHByZWRpY3Rpb24gbWFya2V0LiBBbnlvbmUgY2FuIGNhbGwgdGhpcy4KVHJpZ2dlcnMgZG93bnN0cmVhbSBjb250cmFjdCBjcmVhdGlvbi9pbml0aWFsaXphdGlvbiBvbiB0aGUgbWFya2V0IGNvbnRyYWN0LgpSZXR1cm5zIHRoZSBuZXdseSBnZW5lcmF0ZWQgbWFya2V0X2lkLgAAAAAADWNyZWF0ZV9tYXJrZXQAAAAAAAAEAAAAAAAAAAdjcmVhdG9yAAAAABMAAAAAAAAACHF1ZXN0aW9uAAAAEQAAAAAAAAAPcmVzb2x1dGlvbl90aW1lAAAAAAYAAAAAAAAACW9yYWNsZV9pZAAAAAAAABMAAAABAAAABg==" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_market: this.txFromJSON<MarketMeta>,
        initialize: this.txFromJSON<null>,
        list_markets: this.txFromJSON<Array<u64>>,
        create_market: this.txFromJSON<u64>
  }
}