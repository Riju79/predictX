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
  creator: Address;
  id: u64;
  oracle: Address;
  r_no: i128;
  r_yes: i128;
  res_time: u64;
  status: u32;
  winner: u32;
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
  buy_shares: ({user, market_id, outcome, payment}: {user: string, market_id: u64, outcome: u32, payment: i128}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
  initialize: ({admin, token, factory, treasury}: {admin: string, token: string, factory: string, treasury: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
  sell_shares: ({user, market_id, outcome, shares}: {user: string, market_id: u64, outcome: u32, shares: i128}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
  add_liquidity: ({user, market_id, amount}: {user: string, market_id: u64, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
  create_market: ({creator, market_id, res_time, oracle}: {creator: string, market_id: u64, res_time: u64, oracle: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
  claim_winnings: ({user, market_id}: {user: string, market_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
  resolve_market: ({market_id, outcome}: {market_id: u64, outcome: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
  get_market_state: ({market_id}: {market_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<MarketState>>;
  remove_liquidity: ({user, market_id, amount}: {user: string, market_id: u64, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
  get_balance?: ({user, market_id, outcome}: {user: string, market_id: u64, outcome: u32}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
  get_user_lp?: ({user, market_id}: {user: string, market_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>;
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
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABwAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAFVG9rZW4AAAAAAAAAAAAAAAAAAAdGYWN0b3J5AAAAAAAAAAAAAAAACFRyZWFzdXJ5AAAAAQAAAAAAAAAGTWFya2V0AAAAAAABAAAABgAAAAEAAAAAAAAAB1VzZXJCYWwAAAAAAwAAABMAAAAGAAAABAAAAAEAAAAAAAAABlVzZXJMUAAAAAAAAgAAABMAAAAG",
        "AAAAAQAAAAAAAAAAAAAAC01hcmtldFN0YXRlAAAAAAgAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAACaWQAAAAAAAYAAAAAAAAABm9yYWNsZQAAAAAAEwAAAAAAAAAEcl9ubwAAAAsAAAAAAAAABXJfeWVzAAAAAAAACwAAAAAAAAAIcmVzX3RpbWUAAAAGAAAAAAAAAAZzdGF0dXMAAAAAAAQAAAAAAAAABndpbm5lcgAAAAAABA==",
        "AAAAAAAAAAAAAAAKYnV5X3NoYXJlcwAAAAAABAAAAAAAAAAEdXNlcgAAABMAAAAAAAAACW1hcmtldF9pZAAAAAAAAAYAAAAAAAAAB291dGNvbWUAAAAABAAAAAAAAAAHcGF5bWVudAAAAAALAAAAAQAAAAs=",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABAAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAAB2ZhY3RvcnkAAAAAEwAAAAAAAAAIdHJlYXN1cnkAAAATAAAAAA==",
        "AAAAAAAAAAAAAAALc2VsbF9zaGFyZXMAAAAABAAAAAAAAAAEdXNlcgAAABMAAAAAAAAACW1hcmtldF9pZAAAAAAAAAYAAAAAAAAAB291dGNvbWUAAAAABAAAAAAAAAAGc2hhcmVzAAAAAAALAAAAAQAAAAs=",
        "AAAAAAAAAAAAAAANYWRkX2xpcXVpZGl0eQAAAAAAAAMAAAAAAAAABHVzZXIAAAATAAAAAAAAAAltYXJrZXRfaWQAAAAAAAAGAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAACw==",
        "AAAAAAAAAAAAAAANY3JlYXRlX21hcmtldAAAAAAAAAQAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAJbWFya2V0X2lkAAAAAAAABgAAAAAAAAAIcmVzX3RpbWUAAAAGAAAAAAAAAAZvcmFjbGUAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAOY2xhaW1fd2lubmluZ3MAAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAltYXJrZXRfaWQAAAAAAAAGAAAAAQAAAAs=",
        "AAAAAAAAAAAAAAAOcmVzb2x2ZV9tYXJrZXQAAAAAAAIAAAAAAAAACW1hcmtldF9pZAAAAAAAAAYAAAAAAAAAB291dGNvbWUAAAAABAAAAAA=",
        "AAAAAAAAAAAAAAAQZ2V0X21hcmtldF9zdGF0ZQAAAAEAAAAAAAAACW1hcmtldF9pZAAAAAAAAAYAAAABAAAH0AAAAAtNYXJrZXRTdGF0ZQA=",
        "AAAAAAAAAAAAAAAQcmVtb3ZlX2xpcXVpZGl0eQAAAAMAAAAAAAAABHVzZXIAAAATAAAAAAAAAAltYXJrZXRfaWQAAAAAAAAGAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAACw=="
      ]),
      options
    );
  }

  public readonly fromJSON = {
    buy_shares: this.txFromJSON<i128>,
    initialize: this.txFromJSON<null>,
    sell_shares: this.txFromJSON<i128>,
    add_liquidity: this.txFromJSON<i128>,
    create_market: this.txFromJSON<null>,
    claim_winnings: this.txFromJSON<i128>,
    resolve_market: this.txFromJSON<null>,
    get_market_state: this.txFromJSON<MarketState>,
    remove_liquidity: this.txFromJSON<i128>,
  };
}