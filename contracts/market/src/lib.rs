#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Outcome {
    Yes = 0,
    No = 1,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum MarketStatus {
    Open = 0,
    Resolved = 1,
    Cancelled = 2,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MarketState {
    pub id: u64,
    pub creator: Address,
    pub resolution_time: u64,
    pub oracle_id: Address,
    pub status: MarketStatus,
    pub winning_outcome: Outcome,
    pub yes_reserves: i128,
    pub no_reserves: i128,
}

#[contracttype]
pub enum DataKey {
    Admin,
    TokenAddress,
    FactoryAddress,
    TreasuryAddress,
    Market(u64),
    UserBal(Address, u64, u32),
    UserLP(Address, u64),
}

#[contract]
pub struct Market;

fn get_user_balance(env: &Env, user: &Address, market_id: u64, outcome: Outcome) -> i128 {
    env.storage().persistent().get(&DataKey::UserBal(user.clone(), market_id, outcome as u32)).unwrap_or(0i128)
}

fn set_user_balance(env: &Env, user: &Address, market_id: u64, outcome: Outcome, balance: i128) {
    env.storage().persistent().set(&DataKey::UserBal(user.clone(), market_id, outcome as u32), &balance);
}

fn get_user_deposit(env: &Env, user: &Address, market_id: u64) -> i128 {
    env.storage().persistent().get(&DataKey::UserBal(user.clone(), market_id, 99u32)).unwrap_or(0i128)
}

fn add_user_deposit(env: &Env, user: &Address, market_id: u64, amount: i128) {
    let prev = get_user_deposit(env, user, market_id);
    env.storage().persistent().set(&DataKey::UserBal(user.clone(), market_id, 99u32), &(prev + amount));
}

#[contractimpl]
impl Market {
    /// Initialize the contract with backing token, factory, treasury, and admin
    pub fn initialize(env: Env, admin: Address, token: Address, factory: Address, treasury: Address) {
        if env.storage().instance().has(&DataKey::TokenAddress) {
            panic!();
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenAddress, &token);
        env.storage().instance().set(&DataKey::FactoryAddress, &factory);
        env.storage().instance().set(&DataKey::TreasuryAddress, &treasury);
    }

    /// Create a new market instance. Callable by factory or admin.
    pub fn create_market(
        env: Env,
        creator: Address,
        market_id: u64,
        resolution_time: u64,
        oracle_id: Address,
    ) {
        if let Some(factory) = env.storage().instance().get::<_, Address>(&DataKey::FactoryAddress) {
            factory.require_auth();
        } else {
            creator.require_auth();
        }

        let key = DataKey::Market(market_id);
        if env.storage().persistent().has(&key) {
            panic!();
        }

        let initial_reserve: i128 = 1000000000;

        let state = MarketState {
            id: market_id,
            creator: creator.clone(),
            resolution_time,
            oracle_id,
            status: MarketStatus::Open,
            winning_outcome: Outcome::Yes,
            yes_reserves: initial_reserve,
            no_reserves: initial_reserve,
        };

        env.storage().persistent().set(&DataKey::UserLP(creator, market_id), &2000000000i128);
        env.storage().persistent().set(&key, &state);
    }

    /// Emergency Pause / Unpause toggle
    pub fn set_paused(env: Env, market_id: u64, paused: bool) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key).unwrap();

        state.status = if paused { MarketStatus::Cancelled } else { MarketStatus::Open };
        env.storage().persistent().set(&key, &state);
    }

    /// Emergency Cancel market with deposit refunds
    pub fn cancel_market(env: Env, market_id: u64) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key).unwrap();

        state.status = MarketStatus::Cancelled;
        env.storage().persistent().set(&key, &state);
    }

    /// Add liquidity to an open market pool
    pub fn add_liquidity(env: Env, user: Address, market_id: u64, amount: i128) -> i128 {
        user.require_auth();
        if amount <= 0 {
            panic!();
        }

        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key).unwrap();

        if state.status != MarketStatus::Open {
            panic!();
        }

        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&user, &env.current_contract_address(), &amount);

        state.yes_reserves += amount / 2;
        state.no_reserves += amount / 2;
        env.storage().persistent().set(&key, &state);

        let lp_key = DataKey::UserLP(user.clone(), market_id);
        let current_lp: i128 = env.storage().persistent().get(&lp_key).unwrap_or(0);
        let new_lp = current_lp + amount;
        env.storage().persistent().set(&lp_key, &new_lp);

        new_lp
    }

    /// Remove liquidity from an open market pool
    pub fn remove_liquidity(env: Env, user: Address, market_id: u64, amount: i128) -> i128 {
        user.require_auth();
        if amount <= 0 {
            panic!();
        }

        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key).unwrap();

        let lp_key = DataKey::UserLP(user.clone(), market_id);
        let current_lp: i128 = env.storage().persistent().get(&lp_key).unwrap_or(0);

        if current_lp < amount || state.yes_reserves < amount / 2 || state.no_reserves < amount / 2 {
            panic!();
        }

        state.yes_reserves -= amount / 2;
        state.no_reserves -= amount / 2;
        env.storage().persistent().set(&key, &state);

        let new_lp = current_lp - amount;
        env.storage().persistent().set(&lp_key, &new_lp);

        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &user, &amount);

        new_lp
    }

    /// Buy outcome shares using constant-product AMM pricing
    pub fn buy_shares(
        env: Env,
        user: Address,
        market_id: u64,
        outcome: Outcome,
        payment: i128,
    ) -> i128 {
        user.require_auth();
        if payment <= 0 {
            panic!();
        }

        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key).unwrap();

        if state.status != MarketStatus::Open || env.ledger().timestamp() >= state.resolution_time {
            panic!();
        }

        let fee = payment / 100;
        let creator_fee = payment / 200;
        let net_payment = payment - fee - creator_fee;

        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress).unwrap();
        let token_client = token::Client::new(&env, &token_address);

        token_client.transfer(&user, &env.current_contract_address(), &net_payment);
        if fee > 0 {
            if let Some(treasury) = env.storage().instance().get::<_, Address>(&DataKey::TreasuryAddress) {
                token_client.transfer(&user, &treasury, &fee);
            }
        }
        if creator_fee > 0 {
            token_client.transfer(&user, &state.creator, &creator_fee);
        }

        let shares_out = match outcome {
            Outcome::Yes => {
                let s = (state.yes_reserves * net_payment) / (state.no_reserves + net_payment);
                state.yes_reserves -= s;
                state.no_reserves += net_payment;
                net_payment + s
            }
            Outcome::No => {
                let s = (state.no_reserves * net_payment) / (state.yes_reserves + net_payment);
                state.no_reserves -= s;
                state.yes_reserves += net_payment;
                net_payment + s
            }
        };

        let balance = get_user_balance(&env, &user, market_id, outcome);
        set_user_balance(&env, &user, market_id, outcome, balance + shares_out);
        add_user_deposit(&env, &user, market_id, payment);

        env.storage().persistent().set(&key, &state);

        shares_out
    }

    /// Sell outcome shares back to AMM
    pub fn sell_shares(
        env: Env,
        user: Address,
        market_id: u64,
        outcome: Outcome,
        shares: i128,
    ) -> i128 {
        user.require_auth();
        if shares <= 0 {
            panic!();
        }

        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key).unwrap();

        if state.status != MarketStatus::Open {
            panic!();
        }

        let user_balance = get_user_balance(&env, &user, market_id, outcome);
        if user_balance < shares {
            panic!();
        }

        let collateral_out = match outcome {
            Outcome::Yes => {
                let c = (state.no_reserves * shares) / (state.yes_reserves + shares);
                state.yes_reserves += shares;
                state.no_reserves -= c;
                c
            }
            Outcome::No => {
                let c = (state.yes_reserves * shares) / (state.no_reserves + shares);
                state.no_reserves += shares;
                state.yes_reserves -= c;
                c
            }
        };

        set_user_balance(&env, &user, market_id, outcome, user_balance - shares);

        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &user, &collateral_out);

        env.storage().persistent().set(&key, &state);

        collateral_out
    }

    /// Lock market after resolution timestamp
    pub fn lock_market(env: Env, market_id: u64) {
        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key).unwrap();

        if state.status != MarketStatus::Open || env.ledger().timestamp() < state.resolution_time {
            panic!();
        }

        state.status = MarketStatus::Cancelled;
        env.storage().persistent().set(&key, &state);
    }

    /// Resolve market. Only callable by registered oracle.
    pub fn resolve_market(env: Env, market_id: u64, outcome: Outcome) {
        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key).unwrap();

        if state.status == MarketStatus::Resolved {
            panic!();
        }

        state.oracle_id.require_auth();

        state.status = MarketStatus::Resolved;
        state.winning_outcome = outcome;
        env.storage().persistent().set(&key, &state);
    }

    /// Claim winning payout on resolved market
    pub fn claim_winnings(env: Env, user: Address, market_id: u64) -> i128 {
        user.require_auth();

        let key = DataKey::Market(market_id);
        let state: MarketState = env.storage().persistent().get(&key).unwrap();

        if state.status == MarketStatus::Cancelled {
            let deposit = get_user_deposit(&env, &user, market_id);
            if deposit > 0 {
                env.storage().persistent().set(&DataKey::UserBal(user.clone(), market_id, 99u32), &0i128);
                let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress).unwrap();
                let token_client = token::Client::new(&env, &token_address);
                token_client.transfer(&env.current_contract_address(), &user, &deposit);
                return deposit;
            }
            return 0;
        }

        if state.status != MarketStatus::Resolved {
            panic!();
        }

        let winner = state.winning_outcome;
        let winning_shares = get_user_balance(&env, &user, market_id, winner);

        if winning_shares <= 0 {
            return 0;
        }

        set_user_balance(&env, &user, market_id, winner, 0);

        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &user, &winning_shares);

        winning_shares
    }

    /// Read-only getter for market state
    pub fn get_market_state(env: Env, market_id: u64) -> MarketState {
        env.storage().persistent().get(&DataKey::Market(market_id)).unwrap()
    }

    /// Read-only getter for user share balance
    pub fn get_balance(env: Env, user: Address, market_id: u64, outcome: Outcome) -> i128 {
        get_user_balance(&env, &user, market_id, outcome)
    }
}
