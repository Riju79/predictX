#![no_std]
use soroban_sdk::{contract, contractimpl, contractclient, contracttype, Address, Env, Vec};

// This oracle contract interface is designed to resolve prediction markets on Stellar.
// 
// DECENTRALIZATION TRADEOFF & HOT-SWAPPABLE DESIGN:
// 1. [V1 Tradeoff]: This implementation uses a 3-of-5 multisig committee-based resolution model for MVP simplicity.
// 2. [V2 Roadmap]: The intended v2 replacement is a fully decentralized staked dispute voting oracle.
// 3. To swap the V1 committee oracle for the V2 staked dispute voting oracle (or any custom oracle),
//    simply deploy the new oracle and register its address as the market's oracle during initialization.
//    The interface is decoupled, meaning no code changes to market.rs are required.

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Outcome {
    Yes = 0,
    No = 1,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MarketProposal {
    pub market_id: u64,
    pub outcome: Outcome,
    pub proposer: Address,
    pub proposal_time: u64,
    pub approvals: u32,
    pub disputed: bool,
    pub finalized: bool,
}

#[contracttype]
pub enum DataKey {
    MarketContract,
    Committee,
    ChallengeWindow,
    Proposal(u64),
    Approved(u64, Address),
}

#[contractclient(name = "MarketClient")]
pub trait MarketInterface {
    fn resolve_market(env: Env, market_id: u64, outcome: Outcome);
}

#[contract]
pub struct Oracle;

fn is_committee_member(env: &Env, member: &Address) -> bool {
    let committee: Vec<Address> = env.storage().instance().get(&DataKey::Committee)
        .unwrap_or_else(|| panic!("Committee not initialized"));
    committee.contains(member)
}

#[contractimpl]
impl Oracle {
    /// Initialize the oracle contract with the market contract, committee members, and challenge window duration
    pub fn initialize(
        env: Env,
        market_contract: Address,
        committee: Vec<Address>,
        challenge_window: u64,
    ) {
        if env.storage().instance().has(&DataKey::MarketContract) {
            panic!("Already initialized");
        }
        if committee.len() != 5 {
            panic!("Committee must contain exactly 5 members");
        }
        env.storage().instance().set(&DataKey::MarketContract, &market_contract);
        env.storage().instance().set(&DataKey::Committee, &committee);
        env.storage().instance().set(&DataKey::ChallengeWindow, &challenge_window);
    }

    /// Propose the outcome of a prediction market. Anyone can call this.
    /// Initiates a challenge window during which disputes can be filed.
    pub fn propose_outcome(env: Env, market_id: u64, outcome: Outcome, proposer: Address) {
        proposer.require_auth();

        let key = DataKey::Proposal(market_id);
        if env.storage().persistent().has(&key) {
            panic!("Proposal already exists for this market");
        }

        let proposal = MarketProposal {
            market_id,
            outcome,
            proposer,
            proposal_time: env.ledger().timestamp(),
            approvals: 0,
            disputed: false,
            finalized: false,
        };

        env.storage().persistent().set(&key, &proposal);
    }

    /// Dispute a proposed outcome. Anyone can call this before the challenge window elapses.
    /// Disputed proposals require committee consensus (3-of-5 approvals) to finalize.
    pub fn dispute_outcome(env: Env, market_id: u64, disputer: Address) {
        disputer.require_auth();

        let key = DataKey::Proposal(market_id);
        let mut proposal: MarketProposal = env.storage().persistent().get(&key)
            .unwrap_or_else(|| panic!("Proposal does not exist"));

        if proposal.finalized {
            panic!("Proposal is already finalized");
        }

        let challenge_window: u64 = env.storage().instance().get(&DataKey::ChallengeWindow).unwrap();
        if env.ledger().timestamp() >= proposal.proposal_time + challenge_window {
            panic!("Challenge window has elapsed");
        }

        proposal.disputed = true;
        env.storage().persistent().set(&key, &proposal);
    }

    /// Approve a proposed outcome. Only callable by registered committee members.
    /// Reaching a threshold of 3-of-5 approvals triggers immediate finalization and market resolution.
    pub fn approve(env: Env, market_id: u64, committee_member: Address) {
        committee_member.require_auth();
        if !is_committee_member(&env, &committee_member) {
            panic!("Not a committee member");
        }

        let key = DataKey::Proposal(market_id);
        let mut proposal: MarketProposal = env.storage().persistent().get(&key)
            .unwrap_or_else(|| panic!("Proposal does not exist"));

        if proposal.finalized {
            panic!("Proposal is already finalized");
        }

        let approval_key = DataKey::Approved(market_id, committee_member.clone());
        if env.storage().persistent().has(&approval_key) {
            panic!("Already approved by this committee member");
        }

        // Record approval to prevent double voting
        env.storage().persistent().set(&approval_key, &true);

        proposal.approvals += 1;
        env.storage().persistent().set(&key, &proposal);

        // Consummate finalization if 3 approvals are gathered
        if proposal.approvals >= 3 {
            Self::finalize_internal(&env, &mut proposal);
        }
    }

    /// Finalize resolution for a market.
    /// Can be called by anyone if:
    /// 1. 3-of-5 committee members have approved, OR
    /// 2. The challenge window has elapsed with no disputes.
    pub fn finalize(env: Env, market_id: u64) {
        let key = DataKey::Proposal(market_id);
        let mut proposal: MarketProposal = env.storage().persistent().get(&key)
            .unwrap_or_else(|| panic!("Proposal does not exist"));

        if proposal.finalized {
            panic!("Proposal is already finalized");
        }

        let challenge_window: u64 = env.storage().instance().get(&DataKey::ChallengeWindow).unwrap();
        let window_elapsed = env.ledger().timestamp() >= proposal.proposal_time + challenge_window;

        if proposal.approvals >= 3 {
            Self::finalize_internal(&env, &mut proposal);
        } else if window_elapsed && !proposal.disputed {
            Self::finalize_internal(&env, &mut proposal);
        } else {
            panic!("Cannot finalize yet: either wait for window to elapse without disputes, or gather 3 approvals");
        }
    }
}

impl Oracle {
    fn finalize_internal(env: &Env, proposal: &mut MarketProposal) {
        proposal.finalized = true;
        env.storage().persistent().set(&DataKey::Proposal(proposal.market_id), proposal);

        // Resolve the market by invoking the market contract's resolve_market function
        let market_contract: Address = env.storage().instance().get(&DataKey::MarketContract).unwrap();
        let market_client = MarketClient::new(env, &market_contract);
        market_client.resolve_market(&proposal.market_id, &proposal.outcome);
    }
}

mod test;
