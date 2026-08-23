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




export type DataKey = {tag: "MarketContract", values: void} | {tag: "Committee", values: void} | {tag: "ChallengeWindow", values: void} | {tag: "Proposal", values: readonly [u64]} | {tag: "Approved", values: readonly [u64, string]};

export enum Outcome {
  Yes = 0,
  No = 1,
}


export interface MarketProposal {
  approvals: u32;
  disputed: boolean;
  finalized: boolean;
  market_id: u64;
  outcome: Outcome;
  proposal_time: u64;
  proposer: string;
}

export interface Client {
  /**
   * Construct and simulate a approve transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Approve a proposed outcome. Only callable by registered committee members.
   * Reaching a threshold of 3-of-5 approvals triggers immediate finalization and market resolution.
   */
  approve: ({market_id, committee_member}: {market_id: u64, committee_member: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a finalize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Finalize resolution for a market.
   * Can be called by anyone if:
   * 1. 3-of-5 committee members have approved, OR
   * 2. The challenge window has elapsed with no disputes.
   */
  finalize: ({market_id}: {market_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the oracle contract with the market contract, committee members, and challenge window duration
   */
  initialize: ({market_contract, committee, challenge_window}: {market_contract: string, committee: Array<string>, challenge_window: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a dispute_outcome transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Dispute a proposed outcome. Anyone can call this before the challenge window elapses.
   * Disputed proposals require committee consensus (3-of-5 approvals) to finalize.
   */
  dispute_outcome: ({market_id, disputer}: {market_id: u64, disputer: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a propose_outcome transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Propose the outcome of a prediction market. Anyone can call this.
   * Initiates a challenge window during which disputes can be filed.
   */
  propose_outcome: ({market_id, outcome, proposer}: {market_id: u64, outcome: Outcome, proposer: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

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
      new ContractSpec([ "AAAAAAAAAKpBcHByb3ZlIGEgcHJvcG9zZWQgb3V0Y29tZS4gT25seSBjYWxsYWJsZSBieSByZWdpc3RlcmVkIGNvbW1pdHRlZSBtZW1iZXJzLgpSZWFjaGluZyBhIHRocmVzaG9sZCBvZiAzLW9mLTUgYXBwcm92YWxzIHRyaWdnZXJzIGltbWVkaWF0ZSBmaW5hbGl6YXRpb24gYW5kIG1hcmtldCByZXNvbHV0aW9uLgAAAAAAB2FwcHJvdmUAAAAAAgAAAAAAAAAJbWFya2V0X2lkAAAAAAAABgAAAAAAAAAQY29tbWl0dGVlX21lbWJlcgAAABMAAAAA",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABQAAAAAAAAAAAAAADk1hcmtldENvbnRyYWN0AAAAAAAAAAAAAAAAAAlDb21taXR0ZWUAAAAAAAAAAAAAAAAAAA9DaGFsbGVuZ2VXaW5kb3cAAAAAAQAAAAAAAAAIUHJvcG9zYWwAAAABAAAABgAAAAEAAAAAAAAACEFwcHJvdmVkAAAAAgAAAAYAAAAT",
        "AAAAAwAAAAAAAAAAAAAAB091dGNvbWUAAAAAAgAAAAAAAAADWWVzAAAAAAAAAAAAAAAAAk5vAAAAAAAB",
        "AAAAAAAAAKFGaW5hbGl6ZSByZXNvbHV0aW9uIGZvciBhIG1hcmtldC4KQ2FuIGJlIGNhbGxlZCBieSBhbnlvbmUgaWY6CjEuIDMtb2YtNSBjb21taXR0ZWUgbWVtYmVycyBoYXZlIGFwcHJvdmVkLCBPUgoyLiBUaGUgY2hhbGxlbmdlIHdpbmRvdyBoYXMgZWxhcHNlZCB3aXRoIG5vIGRpc3B1dGVzLgAAAAAAAAhmaW5hbGl6ZQAAAAEAAAAAAAAACW1hcmtldF9pZAAAAAAAAAYAAAAA",
        "AAAAAAAAAGlJbml0aWFsaXplIHRoZSBvcmFjbGUgY29udHJhY3Qgd2l0aCB0aGUgbWFya2V0IGNvbnRyYWN0LCBjb21taXR0ZWUgbWVtYmVycywgYW5kIGNoYWxsZW5nZSB3aW5kb3cgZHVyYXRpb24AAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAwAAAAAAAAAPbWFya2V0X2NvbnRyYWN0AAAAABMAAAAAAAAACWNvbW1pdHRlZQAAAAAAA+oAAAATAAAAAAAAABBjaGFsbGVuZ2Vfd2luZG93AAAABgAAAAA=",
        "AAAAAQAAAAAAAAAAAAAADk1hcmtldFByb3Bvc2FsAAAAAAAHAAAAAAAAAAlhcHByb3ZhbHMAAAAAAAAEAAAAAAAAAAhkaXNwdXRlZAAAAAEAAAAAAAAACWZpbmFsaXplZAAAAAAAAAEAAAAAAAAACW1hcmtldF9pZAAAAAAAAAYAAAAAAAAAB291dGNvbWUAAAAH0AAAAAdPdXRjb21lAAAAAAAAAAANcHJvcG9zYWxfdGltZQAAAAAAAAYAAAAAAAAACHByb3Bvc2VyAAAAEw==",
        "AAAAAAAAAKREaXNwdXRlIGEgcHJvcG9zZWQgb3V0Y29tZS4gQW55b25lIGNhbiBjYWxsIHRoaXMgYmVmb3JlIHRoZSBjaGFsbGVuZ2Ugd2luZG93IGVsYXBzZXMuCkRpc3B1dGVkIHByb3Bvc2FscyByZXF1aXJlIGNvbW1pdHRlZSBjb25zZW5zdXMgKDMtb2YtNSBhcHByb3ZhbHMpIHRvIGZpbmFsaXplLgAAAA9kaXNwdXRlX291dGNvbWUAAAAAAgAAAAAAAAAJbWFya2V0X2lkAAAAAAAABgAAAAAAAAAIZGlzcHV0ZXIAAAATAAAAAA==",
        "AAAAAAAAAIJQcm9wb3NlIHRoZSBvdXRjb21lIG9mIGEgcHJlZGljdGlvbiBtYXJrZXQuIEFueW9uZSBjYW4gY2FsbCB0aGlzLgpJbml0aWF0ZXMgYSBjaGFsbGVuZ2Ugd2luZG93IGR1cmluZyB3aGljaCBkaXNwdXRlcyBjYW4gYmUgZmlsZWQuAAAAAAAPcHJvcG9zZV9vdXRjb21lAAAAAAMAAAAAAAAACW1hcmtldF9pZAAAAAAAAAYAAAAAAAAAB291dGNvbWUAAAAH0AAAAAdPdXRjb21lAAAAAAAAAAAIcHJvcG9zZXIAAAATAAAAAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    approve: this.txFromJSON<null>,
        finalize: this.txFromJSON<null>,
        initialize: this.txFromJSON<null>,
        dispute_outcome: this.txFromJSON<null>,
        propose_outcome: this.txFromJSON<null>
  }
}