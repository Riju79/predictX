#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Outcome {
    Yes = 0,
    No = 1,
    OptionC = 2,
    OptionD = 3,
    OptionE = 4,
    OptionF = 5,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum MarketStatus {
    Open = 0,
    Locked = 1,
    Resolved = 2,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MarketState {
    pub id: u64,
    pub resolution_time: u64,
    pub oracle_id: Address,
    pub status: MarketStatus,
    pub resolved: bool,
    pub winning_outcome: Outcome,
    pub yes_reserves: i128,
    pub no_reserves: i128,
}

#[contracttype]
pub enum DataKey {
    TokenAddress,
    FactoryAddress,
    Market(u64),
    UserYesBalance(Address, u64),
    UserNoBalance(Address, u64),
    UserOutcomeBalance(Address, u64, u32),
}

#[contract]
pub struct Market;

fn get_user_balance(env: &Env, user: &Address, market_id: u64, outcome: Outcome) -> i128 {
    let key = match outcome {
        Outcome::Yes => DataKey::UserYesBalance(user.clone(), market_id),
        Outcome::No => DataKey::UserNoBalance(user.clone(), market_id),
        other => DataKey::UserOutcomeBalance(user.clone(), market_id, other as u32),
    };
    env.storage().persistent().get(&key).unwrap_or(0i128)
}

fn set_user_balance(env: &Env, user: &Address, market_id: u64, outcome: Outcome, balance: i128) {
    let key = match outcome {
        Outcome::Yes => DataKey::UserYesBalance(user.clone(), market_id),
        Outcome::No => DataKey::UserNoBalance(user.clone(), market_id),
        other => DataKey::UserOutcomeBalance(user.clone(), market_id, other as u32),
    };
    env.storage().persistent().set(&key, &balance);
}

#[contractimpl]
impl Market {
    /// Initialize the contract with the backing token and factory contract addresses
    pub fn initialize(env: Env, token: Address, factory: Address) {
        if env.storage().instance().has(&DataKey::TokenAddress) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::TokenAddress, &token);
        env.storage().instance().set(&DataKey::FactoryAddress, &factory);
    }

    /// Create a new market instance. Only callable by the registered factory.
    pub fn create_market(env: Env, market_id: u64, resolution_time: u64, oracle_id: Address) {
        // Enforce that only the factory contract can invoke market creation
        let factory: Address = env.storage().instance().get(&DataKey::FactoryAddress)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        factory.require_auth();

        let key = DataKey::Market(market_id);
        if env.storage().persistent().has(&key) {
            panic!("Market already exists");
        }

        // Initialize with default AMM reserves (e.g. 1000.0000000 units in 7 decimal places)
        let initial_reserve: i128 = 1_000_000_000;

        let state = MarketState {
            id: market_id,
            resolution_time,
            oracle_id,
            status: MarketStatus::Open,
            resolved: false,
            winning_outcome: Outcome::Yes, // Default placeholder
            yes_reserves: initial_reserve,
            no_reserves: initial_reserve,
        };

        env.storage().persistent().set(&key, &state);
    }

    /// Buy outcome shares using Uniswap-style constant-product (x*y=k) calculations.
    /// Pulls backing token payment from user, updates reserves, and mints shares.
    pub fn buy_shares(
        env: Env,
        user: Address,
        market_id: u64,
        outcome: Outcome,
        payment: i128,
    ) -> i128 {
        user.require_auth();
        if payment <= 0 {
            panic!("Payment must be greater than zero");
        }

        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key)
            .unwrap_or_else(|| panic!("Market does not exist"));

        if state.status != MarketStatus::Open {
            panic!("Market is not open");
        }

        if env.ledger().timestamp() >= state.resolution_time {
            panic!("Market resolution time has passed");
        }

        // Transfer backing tokens to contract
        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&user, &env.current_contract_address(), &payment);

        let shares_out = match outcome {
            Outcome::Yes => {
                let s = (state.yes_reserves * payment) / (state.no_reserves + payment);
                state.yes_reserves -= s;
                state.no_reserves += payment;
                payment + s
            }
            Outcome::No | _ => {
                let s = (state.no_reserves * payment) / (state.yes_reserves + payment);
                state.no_reserves -= s;
                state.yes_reserves += payment;
                payment + s
            }
        };

        // Update user balance
        let balance = get_user_balance(&env, &user, market_id, outcome);
        set_user_balance(&env, &user, market_id, outcome, balance + shares_out);

        // Save updated reserves
        env.storage().persistent().set(&key, &state);

        shares_out
    }

    /// Sell outcome shares back to the AMM pool.
    /// Deducts shares from user, updates reserves, and pays out backing tokens.
    pub fn sell_shares(
        env: Env,
        user: Address,
        market_id: u64,
        outcome: Outcome,
        shares: i128,
    ) -> i128 {
        user.require_auth();
        if shares <= 0 {
            panic!("Shares to sell must be greater than zero");
        }

        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key)
            .unwrap_or_else(|| panic!("Market does not exist"));

        if state.status != MarketStatus::Open {
            panic!("Market is not open");
        }

        if env.ledger().timestamp() >= state.resolution_time {
            panic!("Market resolution time has passed");
        }

        let user_balance = get_user_balance(&env, &user, market_id, outcome);
        if user_balance < shares {
            panic!("Insufficient share balance");
        }

        let collateral_out = match outcome {
            Outcome::Yes => {
                let c = (state.no_reserves * shares) / (state.yes_reserves + shares);
                state.yes_reserves += shares;
                state.no_reserves -= c;
                c
            }
            Outcome::No | _ => {
                let c = (state.yes_reserves * shares) / (state.no_reserves + shares);
                state.no_reserves += shares;
                state.yes_reserves -= c;
                c
            }
        };

        // Update user share balance
        set_user_balance(&env, &user, market_id, outcome, user_balance - shares);

        // Transfer backing tokens from contract to user
        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &user, &collateral_out);

        // Save updated reserves
        env.storage().persistent().set(&key, &state);

        collateral_out
    }

    /// Anyone can call this to lock the market once resolution time has passed.
    pub fn lock_market(env: Env, market_id: u64) {
        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key)
            .unwrap_or_else(|| panic!("Market does not exist"));

        if state.status != MarketStatus::Open {
            panic!("Market is not open");
        }

        if env.ledger().timestamp() < state.resolution_time {
            panic!("Resolution time has not passed yet");
        }

        state.status = MarketStatus::Locked;
        env.storage().persistent().set(&key, &state);
    }

    /// Resolve the market. Only callable by the registered oracle.
    pub fn resolve_market(env: Env, market_id: u64, outcome: Outcome) {
        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key)
            .unwrap_or_else(|| panic!("Market does not exist"));

        if state.status == MarketStatus::Resolved {
            panic!("Market is already resolved");
        }

        // Only the registered oracle contract can authorize this call
        state.oracle_id.require_auth();

        state.status = MarketStatus::Resolved;
        state.resolved = true;
        state.winning_outcome = outcome;
        env.storage().persistent().set(&key, &state);
    }

    /// Claim winnings on a resolved market.
    /// Burns winning shares and pays out pro-rata backing tokens from the pool.
    pub fn claim_winnings(env: Env, user: Address, market_id: u64) -> i128 {
        user.require_auth();

        let key = DataKey::Market(market_id);
        let state: MarketState = env.storage().persistent().get(&key)
            .unwrap_or_else(|| panic!("Market does not exist"));

        if state.status != MarketStatus::Resolved {
            panic!("Market is not resolved yet");
        }

        let winner = state.winning_outcome;
        let winning_shares = get_user_balance(&env, &user, market_id, winner);

        if winning_shares <= 0 {
            return 0;
        }

        // Clear user share balance to burn them
        set_user_balance(&env, &user, market_id, winner, 0);

        // Pay out 1 collateral token per winning share
        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &user, &winning_shares);

        winning_shares
    }

    /// Read-only getter for market state
    pub fn get_market_state(env: Env, market_id: u64) -> MarketState {
        env.storage().persistent().get(&DataKey::Market(market_id))
            .unwrap_or_else(|| panic!("Market does not exist"))
    }

    /// Read-only getter for user share balance
    pub fn get_balance(env: Env, user: Address, market_id: u64, outcome: Outcome) -> i128 {
        get_user_balance(&env, &user, market_id, outcome)
    }
}

mod test;
