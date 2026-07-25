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
  create_market: ({creator, market_id, resolution_time, oracle_id}: {creator: string, market_id: u64, resolution_time: u64, oracle_id: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
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
      new ContractSpec([]),
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