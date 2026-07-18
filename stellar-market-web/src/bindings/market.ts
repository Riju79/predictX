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




export type DataKey = {tag: "TokenAddress", values: void} | {tag: "FactoryAddress", values: void} | {tag: "Market", values: readonly [u64]} | {tag: "UserYesBalance", values: readonly [string, u64]} | {tag: "UserNoBalance", values: readonly [string, u64]};

export enum Outcome {
  Yes = 0,
  No = 1,
}


export interface MarketState {
  id: u64;
  no_reserves: i128;
  oracle_id: string;
  resolution_time: u64;
  resolved: boolean;
  status: MarketStatus;
  winning_outcome: Outcome;
  yes_reserves: i128;
}

export enum MarketStatus {
  Open = 0,
  Locked = 1,
  Resolved = 2,
}

export interface Client {
  /**
   * Construct and simulate a buy_shares transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Buy outcome shares using Uniswap-style constant-product (x*y=k) calculations.
   * Pulls backing token payment from user, updates reserves, and mints shares.
   */
  buy_shares: ({user, market_id, outcome, payment}: {user: string, market_id: u64, outcome: Outcome, payment: i128}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the contract with the backing token and factory contract addresses
   */
  initialize: ({token, factory}: {token: string, factory: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_balance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Read-only getter for user share balance
   */
  get_balance: ({user, market_id, outcome}: {user: string, market_id: u64, outcome: Outcome}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a lock_market transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Anyone can call this to lock the market once resolution time has passed.
   */
  lock_market: ({market_id}: {market_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a sell_shares transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Sell outcome shares back to the AMM pool.
   * Deducts shares from user, updates reserves, and pays out backing tokens.
   */
  sell_shares: ({user, market_id, outcome, shares}: {user: string, market_id: u64, outcome: Outcome, shares: i128}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a create_market transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Create a new market instance. Only callable by the registered factory.
   */
  create_market: ({market_id, resolution_time, oracle_id}: {market_id: u64, resolution_time: u64, oracle_id: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a claim_winnings transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Claim winnings on a resolved market.
   * Burns winning shares and pays out pro-rata backing tokens from the pool.
   */
  claim_winnings: ({user, market_id}: {user: string, market_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a resolve_market transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Resolve the market. Only callable by the registered oracle.
   */
  resolve_market: ({market_id, outcome}: {market_id: u64, outcome: Outcome}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_market_state transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Read-only getter for market state
   */
  get_market_state: ({market_id}: {market_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<MarketState>>

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
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABQAAAAAAAAAAAAAADFRva2VuQWRkcmVzcwAAAAAAAAAAAAAADkZhY3RvcnlBZGRyZXNzAAAAAAABAAAAAAAAAAZNYXJrZXQAAAAAAAEAAAAGAAAAAQAAAAAAAAAOVXNlclllc0JhbGFuY2UAAAAAAAIAAAATAAAABgAAAAEAAAAAAAAADVVzZXJOb0JhbGFuY2UAAAAAAAACAAAAEwAAAAY=",
        "AAAAAwAAAAAAAAAAAAAAB091dGNvbWUAAAAAAgAAAAAAAAADWWVzAAAAAAAAAAAAAAAAAk5vAAAAAAAB",
        "AAAAAAAAAJhCdXkgb3V0Y29tZSBzaGFyZXMgdXNpbmcgVW5pc3dhcC1zdHlsZSBjb25zdGFudC1wcm9kdWN0ICh4Knk9aykgY2FsY3VsYXRpb25zLgpQdWxscyBiYWNraW5nIHRva2VuIHBheW1lbnQgZnJvbSB1c2VyLCB1cGRhdGVzIHJlc2VydmVzLCBhbmQgbWludHMgc2hhcmVzLgAAAApidXlfc2hhcmVzAAAAAAAEAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAJbWFya2V0X2lkAAAAAAAABgAAAAAAAAAHb3V0Y29tZQAAAAfQAAAAB091dGNvbWUAAAAAAAAAAAdwYXltZW50AAAAAAsAAAABAAAACw==",
        "AAAAAAAAAE1Jbml0aWFsaXplIHRoZSBjb250cmFjdCB3aXRoIHRoZSBiYWNraW5nIHRva2VuIGFuZCBmYWN0b3J5IGNvbnRyYWN0IGFkZHJlc3NlcwAAAAAAAAppbml0aWFsaXplAAAAAAACAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAAB2ZhY3RvcnkAAAAAEwAAAAA=",
        "AAAAAAAAACdSZWFkLW9ubHkgZ2V0dGVyIGZvciB1c2VyIHNoYXJlIGJhbGFuY2UAAAAAC2dldF9iYWxhbmNlAAAAAAMAAAAAAAAABHVzZXIAAAATAAAAAAAAAAltYXJrZXRfaWQAAAAAAAAGAAAAAAAAAAdvdXRjb21lAAAAB9AAAAAHT3V0Y29tZQAAAAABAAAACw==",
        "AAAAAAAAAEhBbnlvbmUgY2FuIGNhbGwgdGhpcyB0byBsb2NrIHRoZSBtYXJrZXQgb25jZSByZXNvbHV0aW9uIHRpbWUgaGFzIHBhc3NlZC4AAAALbG9ja19tYXJrZXQAAAAAAQAAAAAAAAAJbWFya2V0X2lkAAAAAAAABgAAAAA=",
        "AAAAAAAAAHJTZWxsIG91dGNvbWUgc2hhcmVzIGJhY2sgdG8gdGhlIEFNTSBwb29sLgpEZWR1Y3RzIHNoYXJlcyBmcm9tIHVzZXIsIHVwZGF0ZXMgcmVzZXJ2ZXMsIGFuZCBwYXlzIG91dCBiYWNraW5nIHRva2Vucy4AAAAAAAtzZWxsX3NoYXJlcwAAAAAEAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAJbWFya2V0X2lkAAAAAAAABgAAAAAAAAAHb3V0Y29tZQAAAAfQAAAAB091dGNvbWUAAAAAAAAAAAZzaGFyZXMAAAAAAAsAAAABAAAACw==",
        "AAAAAQAAAAAAAAAAAAAAC01hcmtldFN0YXRlAAAAAAgAAAAAAAAAAmlkAAAAAAAGAAAAAAAAAAtub19yZXNlcnZlcwAAAAALAAAAAAAAAAlvcmFjbGVfaWQAAAAAAAATAAAAAAAAAA9yZXNvbHV0aW9uX3RpbWUAAAAABgAAAAAAAAAIcmVzb2x2ZWQAAAABAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAAMTWFya2V0U3RhdHVzAAAAAAAAAA93aW5uaW5nX291dGNvbWUAAAAH0AAAAAdPdXRjb21lAAAAAAAAAAAMeWVzX3Jlc2VydmVzAAAACw==",
        "AAAAAwAAAAAAAAAAAAAADE1hcmtldFN0YXR1cwAAAAMAAAAAAAAABE9wZW4AAAAAAAAAAAAAAAZMb2NrZWQAAAAAAAEAAAAAAAAACFJlc29sdmVkAAAAAg==",
        "AAAAAAAAAEZDcmVhdGUgYSBuZXcgbWFya2V0IGluc3RhbmNlLiBPbmx5IGNhbGxhYmxlIGJ5IHRoZSByZWdpc3RlcmVkIGZhY3RvcnkuAAAAAAANY3JlYXRlX21hcmtldAAAAAAAAAMAAAAAAAAACW1hcmtldF9pZAAAAAAAAAYAAAAAAAAAD3Jlc29sdXRpb25fdGltZQAAAAAGAAAAAAAAAAlvcmFjbGVfaWQAAAAAAAATAAAAAA==",
        "AAAAAAAAAG1DbGFpbSB3aW5uaW5ncyBvbiBhIHJlc29sdmVkIG1hcmtldC4KQnVybnMgd2lubmluZyBzaGFyZXMgYW5kIHBheXMgb3V0IHByby1yYXRhIGJhY2tpbmcgdG9rZW5zIGZyb20gdGhlIHBvb2wuAAAAAAAADmNsYWltX3dpbm5pbmdzAAAAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAJbWFya2V0X2lkAAAAAAAABgAAAAEAAAAL",
        "AAAAAAAAADtSZXNvbHZlIHRoZSBtYXJrZXQuIE9ubHkgY2FsbGFibGUgYnkgdGhlIHJlZ2lzdGVyZWQgb3JhY2xlLgAAAAAOcmVzb2x2ZV9tYXJrZXQAAAAAAAIAAAAAAAAACW1hcmtldF9pZAAAAAAAAAYAAAAAAAAAB291dGNvbWUAAAAH0AAAAAdPdXRjb21lAAAAAAA=",
        "AAAAAAAAACFSZWFkLW9ubHkgZ2V0dGVyIGZvciBtYXJrZXQgc3RhdGUAAAAAAAAQZ2V0X21hcmtldF9zdGF0ZQAAAAEAAAAAAAAACW1hcmtldF9pZAAAAAAAAAYAAAABAAAH0AAAAAtNYXJrZXRTdGF0ZQA=" ]),
      options
    )
  }
  public readonly fromJSON = {
    buy_shares: this.txFromJSON<i128>,
        initialize: this.txFromJSON<null>,
        get_balance: this.txFromJSON<i128>,
        lock_market: this.txFromJSON<null>,
        sell_shares: this.txFromJSON<i128>,
        create_market: this.txFromJSON<null>,
        claim_winnings: this.txFromJSON<i128>,
        resolve_market: this.txFromJSON<null>,
        get_market_state: this.txFromJSON<MarketState>
  }
}