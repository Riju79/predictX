#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, token, Address, Env, Symbol};

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
    Cancelled = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MarketState {
    pub id: u64,
    pub creator: Address,
    pub resolution_time: u64,
    pub oracle_id: Address,
    pub status: MarketStatus,
    pub resolved: bool,
    pub paused: bool,
    pub winning_outcome: Outcome,
    pub yes_reserves: i128,
    pub no_reserves: i128,
    pub total_volume: i128,
    pub total_liquidity: i128,
    pub protocol_fee_bps: u32,
    pub creator_fee_bps: u32,
}

#[contracttype]
pub enum DataKey {
    Admin,
    TokenAddress,
    FactoryAddress,
    TreasuryAddress,
    Market(u64),
    UserYesBalance(Address, u64),
    UserNoBalance(Address, u64),
    UserOutcomeBalance(Address, u64, u32),
    UserTotalDeposit(Address, u64),
    UserLP(Address, u64),
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

fn get_user_deposit(env: &Env, user: &Address, market_id: u64) -> i128 {
    env.storage().persistent().get(&DataKey::UserTotalDeposit(user.clone(), market_id)).unwrap_or(0i128)
}

fn add_user_deposit(env: &Env, user: &Address, market_id: u64, amount: i128) {
    let prev = get_user_deposit(env, user, market_id);
    env.storage().persistent().set(&DataKey::UserTotalDeposit(user.clone(), market_id), &(prev + amount));
}

#[contractimpl]
impl Market {
    /// Initialize the contract with backing token, factory, treasury, and admin
    pub fn initialize(env: Env, admin: Address, token: Address, factory: Address, treasury: Address) {
        if env.storage().instance().has(&DataKey::TokenAddress) {
            panic!("Already initialized");
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
        let factory: Address = env.storage().instance().get(&DataKey::FactoryAddress)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        factory.require_auth();

        let key = DataKey::Market(market_id);
        if env.storage().persistent().has(&key) {
            panic!("Market already exists");
        }

        let initial_reserve: i128 = 1_000_000_000; // 100 tokens default initial liquidity

        let state = MarketState {
            id: market_id,
            creator: creator.clone(),
            resolution_time,
            oracle_id,
            status: MarketStatus::Open,
            resolved: false,
            paused: false,
            winning_outcome: Outcome::Yes,
            yes_reserves: initial_reserve,
            no_reserves: initial_reserve,
            total_volume: 0,
            total_liquidity: initial_reserve * 2,
            protocol_fee_bps: 100, // 1% protocol fee
            creator_fee_bps: 50,  // 0.5% creator fee
        };

        // Record initial creator seed LP position
        env.storage().persistent().set(&DataKey::UserLP(creator.clone(), market_id), &(initial_reserve * 2));
        env.storage().persistent().set(&key, &state);

        env.events().publish(
            (symbol_short!("M_Created"), market_id),
            (resolution_time, initial_reserve),
        );
    }

    /// Emergency Pause / Unpause toggle
    pub fn set_paused(env: Env, market_id: u64, paused: bool) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        admin.require_auth();

        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key)
            .unwrap_or_else(|| panic!("Market does not exist"));

        state.paused = paused;
        env.storage().persistent().set(&key, &state);

        env.events().publish((symbol_short!("M_Paused"), market_id), paused);
    }

    /// Emergency Cancel market with deposit refunds
    pub fn cancel_market(env: Env, market_id: u64) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        admin.require_auth();

        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key)
            .unwrap_or_else(|| panic!("Market does not exist"));

        state.status = MarketStatus::Cancelled;
        env.storage().persistent().set(&key, &state);

        env.events().publish((symbol_short!("M_Cancel"), market_id), ());
    }

    /// Add liquidity to an open market pool
    pub fn add_liquidity(env: Env, user: Address, market_id: u64, amount: i128) -> i128 {
        user.require_auth();
        if amount <= 0 {
            panic!("Liquidity amount must be positive");
        }

        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key)
            .unwrap_or_else(|| panic!("Market does not exist"));

        if state.paused {
            panic!("Market trading is paused");
        }
        if state.status != MarketStatus::Open {
            panic!("Market is not open");
        }

        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&user, &env.current_contract_address(), &amount);

        // Update pool reserves equally for YES and NO pools
        state.yes_reserves += amount / 2;
        state.no_reserves += amount / 2;
        state.total_liquidity += amount;
        env.storage().persistent().set(&key, &state);

        // Update user LP deposit
        let lp_key = DataKey::UserLP(user.clone(), market_id);
        let current_lp: i128 = env.storage().persistent().get(&lp_key).unwrap_or(0);
        let new_lp = current_lp + amount;
        env.storage().persistent().set(&lp_key, &new_lp);

        env.events().publish((symbol_short!("LP_Add"), market_id, user), amount);

        new_lp
    }

    /// Remove liquidity from an open market pool
    pub fn remove_liquidity(env: Env, user: Address, market_id: u64, amount: i128) -> i128 {
        user.require_auth();
        if amount <= 0 {
            panic!("Liquidity withdrawal amount must be positive");
        }

        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key)
            .unwrap_or_else(|| panic!("Market does not exist"));

        let lp_key = DataKey::UserLP(user.clone(), market_id);
        let current_lp: i128 = env.storage().persistent().get(&lp_key).unwrap_or(0);

        if current_lp < amount {
            panic!("Insufficient LP balance");
        }

        if state.yes_reserves < amount / 2 || state.no_reserves < amount / 2 {
            panic!("Market pool reserves insufficient for full withdrawal");
        }

        state.yes_reserves -= amount / 2;
        state.no_reserves -= amount / 2;
        state.total_liquidity -= amount;
        env.storage().persistent().set(&key, &state);

        let new_lp = current_lp - amount;
        env.storage().persistent().set(&lp_key, &new_lp);

        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &user, &amount);

        env.events().publish((symbol_short!("LP_Rem"), market_id, user), amount);

        new_lp
    }

    /// Read-only getter for user LP deposit
    pub fn get_user_lp(env: Env, user: Address, market_id: u64) -> i128 {
        env.storage().persistent().get(&DataKey::UserLP(user, market_id)).unwrap_or(0)
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
            panic!("Payment must be positive");
        }

        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key)
            .unwrap_or_else(|| panic!("Market does not exist"));

        if state.paused {
            panic!("Market trading is paused");
        }

        if state.status != MarketStatus::Open {
            panic!("Market is not open");
        }

        if env.ledger().timestamp() >= state.resolution_time {
            panic!("Market resolution time has passed");
        }

        // Deduct protocol and creator fees
        let fee = (payment * (state.protocol_fee_bps as i128)) / 10000;
        let creator_fee = (payment * (state.creator_fee_bps as i128)) / 10000;
        let net_payment = payment - fee - creator_fee;

        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        let token_client = token::Client::new(&env, &token_address);

        // Transfer net payment to contract, fee to treasury, creator_fee to creator
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
            Outcome::No | _ => {
                let s = (state.no_reserves * net_payment) / (state.yes_reserves + net_payment);
                state.no_reserves -= s;
                state.yes_reserves += net_payment;
                net_payment + s
            }
        };

        let balance = get_user_balance(&env, &user, market_id, outcome);
        set_user_balance(&env, &user, market_id, outcome, balance + shares_out);
        add_user_deposit(&env, &user, market_id, payment);

        state.total_volume += payment;
        env.storage().persistent().set(&key, &state);

        env.events().publish(
            (symbol_short!("Trade_Buy"), market_id, user),
            (payment, shares_out),
        );

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
            panic!("Shares must be positive");
        }

        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key)
            .unwrap_or_else(|| panic!("Market does not exist"));

        if state.paused {
            panic!("Market trading is paused");
        }

        if state.status != MarketStatus::Open {
            panic!("Market is not open");
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

        set_user_balance(&env, &user, market_id, outcome, user_balance - shares);

        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &user, &collateral_out);

        env.storage().persistent().set(&key, &state);

        env.events().publish(
            (symbol_short!("TradeSell"), market_id, user),
            (shares, collateral_out),
        );

        collateral_out
    }

    /// Lock market after resolution timestamp
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

    /// Resolve market. Only callable by registered oracle.
    pub fn resolve_market(env: Env, market_id: u64, outcome: Outcome) {
        let key = DataKey::Market(market_id);
        let mut state: MarketState = env.storage().persistent().get(&key)
            .unwrap_or_else(|| panic!("Market does not exist"));

        if state.status == MarketStatus::Resolved {
            panic!("Market is already resolved");
        }

        state.oracle_id.require_auth();

        state.status = MarketStatus::Resolved;
        state.resolved = true;
        state.winning_outcome = outcome;
        env.storage().persistent().set(&key, &state);

        env.events().publish((symbol_short!("M_Resolve"), market_id), outcome as u32);
    }

    /// Claim winning payout on resolved market
    pub fn claim_winnings(env: Env, user: Address, market_id: u64) -> i128 {
        user.require_auth();

        let key = DataKey::Market(market_id);
        let state: MarketState = env.storage().persistent().get(&key)
            .unwrap_or_else(|| panic!("Market does not exist"));

        if state.status == MarketStatus::Cancelled {
            // Refund total deposits if market was cancelled
            let deposit = get_user_deposit(&env, &user, market_id);
            if deposit > 0 {
                env.storage().persistent().set(&DataKey::UserTotalDeposit(user.clone(), market_id), &0i128);
                let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress)
                    .unwrap_or_else(|| panic!("Contract not initialized"));
                let token_client = token::Client::new(&env, &token_address);
                token_client.transfer(&env.current_contract_address(), &user, &deposit);
                return deposit;
            }
            return 0;
        }

        if state.status != MarketStatus::Resolved {
            panic!("Market is not resolved yet");
        }

        let winner = state.winning_outcome;
        let winning_shares = get_user_balance(&env, &user, market_id, winner);

        if winning_shares <= 0 {
            return 0;
        }

        set_user_balance(&env, &user, market_id, winner, 0);

        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &user, &winning_shares);

        env.events().publish(
            (symbol_short!("M_Claim"), market_id, user),
            winning_shares,
        );

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
