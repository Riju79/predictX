import { Buffer } from "buffer";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";

export type u32 = number;
export type i32 = number;
export type u64 = bigint;
export type i64 = bigint;
export type u128 = bigint;
export type i128 = bigint;
export type u256 = bigint;
export type i256 = bigint;
export type Address = string;
export type Option<T> = T | undefined;

export interface MarketState {
  id: u64;
  no_reserves: i128;
  oracle_id: string;
  resolution_time: u64;
  resolved: boolean;
  status: MarketStatus;
  winning_outcome: Outcome;
  yes_reserves: i128;
  total_liquidity?: i128;
}

export enum MarketStatus {
  Open = 0,
  Locked = 1,
  Resolved = 2,
}

export enum Outcome {
  Yes = 0,
  No = 1,
}

export interface Client {
  buy_shares: ({user, market_id, outcome, payment}: {user: string, market_id: u64, outcome: Outcome, payment: i128}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
  initialize: ({admin, token, factory, treasury}: {admin: string, token: string, factory: string, treasury: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
  get_balance: ({user, market_id, outcome}: {user: string, market_id: u64, outcome: Outcome}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
  lock_market: ({market_id}: {market_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
  sell_shares: ({user, market_id, outcome, shares}: {user: string, market_id: u64, outcome: Outcome, shares: i128}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
  create_market: ({market_id, resolution_time, oracle_id}: {market_id: u64, resolution_time: u64, oracle_id: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
  claim_winnings: ({user, market_id}: {user: string, market_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
  resolve_market: ({market_id, outcome}: {market_id: u64, outcome: Outcome}, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
  get_market_state: ({market_id}: {market_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<MarketState>>;
  add_liquidity: ({user, market_id, amount}: {user: string, market_id: u64, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
  remove_liquidity: ({user, market_id, amount}: {user: string, market_id: u64, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
  get_user_lp: ({user, market_id}: {user: string, market_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
}

export class Client extends ContractClient {
  static async deploy<T = Client>(
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        wasmHash: Buffer | string;
        salt?: Buffer | Uint8Array;
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options);
  }

  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABQAAAAAAAAAAAAAADFRva2VuQWRkcmVzcwAAAAAAAAAAAAAADkZhY3RvcnlBZGRyZXNzAAAAAAABAAAAAAAAAAZNYXJrZXQAAAAAAAEAAAAGAAAAAQAAAAAAAAAOVXNlclllc0JhbGFuY2UAAAAAAAIAAAATAAAABgAAAAEAAAAAAAAADVVzZXJOb0JhbGFuY2UAAAAAAAACAAAAEwAAAAY=",
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
        "AAAAAAAAACFSZWFkLW9ubHkgZ2V0dGVyIGZvciBtYXJrZXQgc3RhdGUAAAAAAAAQZ2V0X21hcmtldF9zdGF0ZQAAAAEAAAAAAAAACW1hcmtldF9pZAAAAAAAAAYAAAABAAAH0AAAAAtNYXJrZXRTdGF0ZQA="
      ]),
      options
    );
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
    get_market_state: this.txFromJSON<MarketState>,
    add_liquidity: this.txFromJSON<i128>,
    remove_liquidity: this.txFromJSON<i128>,
    get_user_lp: this.txFromJSON<i128>,
  };
}