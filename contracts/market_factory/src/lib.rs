#![no_std]
use soroban_sdk::{contract, contractimpl, contractclient, contracttype, Address, Env, Symbol, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MarketMeta {
    pub id: u64,
    pub creator: Address,
    pub question: Symbol,
    pub resolution_time: u64,
    pub oracle_id: Address,
    pub resolved: bool,
    pub winning_outcome: Option<u32>,
}

#[contracttype]
pub enum DataKey {
    MarketContract,
    MarketCounter,
    Market(u64),
    MarketList,
}

#[contractclient(name = "MarketClient")]
pub trait MarketInterface {
    fn create_market(env: Env, market_id: u64, resolution_time: u64, oracle_id: Address);
}

#[contract]
pub struct MarketFactory;

#[contractimpl]
impl MarketFactory {
    /// Initialize the factory with the core market contract address
    pub fn initialize(env: Env, market_contract: Address) {
        if env.storage().instance().has(&DataKey::MarketContract) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::MarketContract, &market_contract);
    }

    /// Creates a new prediction market. Anyone can call this.
    /// Triggers downstream contract creation/initialization on the market contract.
    /// Returns the newly generated market_id.
    pub fn create_market(
        env: Env,
        creator: Address,
        question: Symbol,
        resolution_time: u64,
        oracle_id: Address,
    ) -> u64 {
        // Enforce that the creator has signed this transaction
        creator.require_auth();

        // Enforce that the resolution time is in the future
        let current_time = env.ledger().timestamp();
        if resolution_time <= current_time {
            panic!("resolution_time must be in the future");
        }

        // Increment the counter
        let mut current_counter = env.storage().instance().get(&DataKey::MarketCounter).unwrap_or(0u64);
        current_counter += 1;
        env.storage().instance().set(&DataKey::MarketCounter, &current_counter);

        let market_id = current_counter;

        // Build the market metadata
        let market = MarketMeta {
            id: market_id,
            creator: creator.clone(),
            question: question.clone(),
            resolution_time,
            oracle_id: oracle_id.clone(),
            resolved: false,
            winning_outcome: None,
        };

        // Store market in persistent storage
        env.storage().persistent().set(&DataKey::Market(market_id), &market);

        // Update the list of market IDs
        let mut list: Vec<u64> = env.storage().persistent().get(&DataKey::MarketList).unwrap_or(Vec::new(&env));
        list.push_back(market_id);
        env.storage().persistent().set(&DataKey::MarketList, &list);

        // Call the market contract to register the market state machine
        let market_contract: Address = env.storage().instance().get(&DataKey::MarketContract)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        let market_client = MarketClient::new(&env, &market_contract);
        market_client.create_market(&market_id, &resolution_time, &oracle_id);

        // Emit MarketCreated event
        env.events().publish(
            (Symbol::new(&env, "MarketCreated"), market_id, creator),
            (question, resolution_time),
        );

        market_id
    }

    /// Read-only getter to fetch market metadata by market_id
    pub fn get_market(env: Env, market_id: u64) -> MarketMeta {
        env.storage().persistent()
            .get(&DataKey::Market(market_id))
            .unwrap_or_else(|| panic!("Market does not exist"))
    }

    /// Read-only getter to list all market IDs
    pub fn list_markets(env: Env) -> Vec<u64> {
        env.storage().persistent()
            .get(&DataKey::MarketList)
            .unwrap_or_else(|| Vec::new(&env))
    }
}

mod test;
