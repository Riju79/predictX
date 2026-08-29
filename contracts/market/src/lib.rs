#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MarketState {
    pub id: u64,
    pub creator: Address,
    pub res_time: u64,
    pub oracle: Address,
    pub status: u32,
    pub winner: u32,
    pub r_yes: i128,
    pub r_no: i128,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Token,
    Factory,
    Treasury,
    Market(u64),
    UserBal(Address, u64, u32),
    UserLP(Address, u64),
}

#[contract]
pub struct Market;

#[contractimpl]
impl Market {
    pub fn initialize(env: Env, admin: Address, token: Address, factory: Address, treasury: Address) {
        if env.storage().instance().has(&DataKey::Token) { panic!(); }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::Factory, &factory);
        env.storage().instance().set(&DataKey::Treasury, &treasury);
    }

    pub fn create_market(env: Env, creator: Address, market_id: u64, res_time: u64, oracle: Address) {
        if let Some(f) = env.storage().instance().get::<_, Address>(&DataKey::Factory) { f.require_auth(); }
        else { creator.require_auth(); }
        let k = DataKey::Market(market_id);
        if env.storage().persistent().has(&k) { panic!(); }

        let st = MarketState {
            id: market_id,
            creator: creator.clone(),
            res_time,
            oracle,
            status: 0,
            winner: 0,
            r_yes: 1_000_000_000,
            r_no: 1_000_000_000,
        };
        env.storage().persistent().set(&DataKey::UserLP(creator, market_id), &2_000_000_000i128);
        env.storage().persistent().set(&k, &st);
    }

    pub fn add_liquidity(env: Env, user: Address, market_id: u64, amount: i128) -> i128 {
        user.require_auth();
        if amount <= 0 { panic!(); }
        let k = DataKey::Market(market_id);
        let mut st: MarketState = env.storage().persistent().get(&k).unwrap();
        if st.status != 0 { panic!(); }

        let taddr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        token::Client::new(&env, &taddr).transfer(&user, &env.current_contract_address(), &amount);

        let h = amount / 2;
        st.r_yes += h;
        st.r_no += h;
        env.storage().persistent().set(&k, &st);

        let lk = DataKey::UserLP(user, market_id);
        let cur: i128 = env.storage().persistent().get(&lk).unwrap_or(0);
        let nlp = cur + amount;
        env.storage().persistent().set(&lk, &nlp);
        nlp
    }

    pub fn remove_liquidity(env: Env, user: Address, market_id: u64, amount: i128) -> i128 {
        user.require_auth();
        if amount <= 0 { panic!(); }
        let k = DataKey::Market(market_id);
        let mut st: MarketState = env.storage().persistent().get(&k).unwrap();
        let lk = DataKey::UserLP(user.clone(), market_id);
        let cur: i128 = env.storage().persistent().get(&lk).unwrap_or(0);

        let h = amount / 2;
        if cur < amount || st.r_yes < h || st.r_no < h { panic!(); }

        st.r_yes -= h;
        st.r_no -= h;
        env.storage().persistent().set(&k, &st);

        let nlp = cur - amount;
        env.storage().persistent().set(&lk, &nlp);
        let taddr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        token::Client::new(&env, &taddr).transfer(&env.current_contract_address(), &user, &amount);
        nlp
    }

    pub fn buy_shares(env: Env, user: Address, market_id: u64, outcome: u32, payment: i128) -> i128 {
        user.require_auth();
        if payment <= 0 { panic!(); }
        let k = DataKey::Market(market_id);
        let mut st: MarketState = env.storage().persistent().get(&k).unwrap();
        if st.status != 0 || env.ledger().timestamp() >= st.res_time { panic!(); }

        let taddr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let tc = token::Client::new(&env, &taddr);
        tc.transfer(&user, &env.current_contract_address(), &payment);

        let (r1, r2) = if outcome == 0 { (&mut st.r_yes, &mut st.r_no) } else { (&mut st.r_no, &mut st.r_yes) };
        let s = (*r1 * payment) / (*r2 + payment);
        *r1 -= s;
        *r2 += payment;
        let s_out = payment + s;

        let uk = DataKey::UserBal(user, market_id, outcome);
        let cur: i128 = env.storage().persistent().get(&uk).unwrap_or(0);
        env.storage().persistent().set(&uk, &(cur + s_out));
        env.storage().persistent().set(&k, &st);
        s_out
    }

    pub fn sell_shares(env: Env, user: Address, market_id: u64, outcome: u32, shares: i128) -> i128 {
        user.require_auth();
        if shares <= 0 { panic!(); }
        let k = DataKey::Market(market_id);
        let mut st: MarketState = env.storage().persistent().get(&k).unwrap();
        if st.status != 0 { panic!(); }

        let uk = DataKey::UserBal(user.clone(), market_id, outcome);
        let cur: i128 = env.storage().persistent().get(&uk).unwrap_or(0);
        if cur < shares { panic!(); }

        let (r1, r2) = if outcome == 0 { (&mut st.r_yes, &mut st.r_no) } else { (&mut st.r_no, &mut st.r_yes) };
        let payout = (*r2 * shares) / (*r1 + shares);
        *r1 += shares;
        *r2 -= payout;

        env.storage().persistent().set(&uk, &(cur - shares));
        let taddr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        token::Client::new(&env, &taddr).transfer(&env.current_contract_address(), &user, &payout);
        env.storage().persistent().set(&k, &st);
        payout
    }

    pub fn resolve_market(env: Env, market_id: u64, outcome: u32) {
        let k = DataKey::Market(market_id);
        let mut st: MarketState = env.storage().persistent().get(&k).unwrap();
        if st.status == 1 { panic!(); }
        st.oracle.require_auth();
        st.status = 1;
        st.winner = outcome;
        env.storage().persistent().set(&k, &st);
    }

    pub fn claim_winnings(env: Env, user: Address, market_id: u64) -> i128 {
        user.require_auth();
        let k = DataKey::Market(market_id);
        let st: MarketState = env.storage().persistent().get(&k).unwrap();
        if st.status != 1 { panic!(); }

        let uk = DataKey::UserBal(user.clone(), market_id, st.winner);
        let shares: i128 = env.storage().persistent().get(&uk).unwrap_or(0);
        if shares <= 0 { return 0; }

        env.storage().persistent().set(&uk, &0i128);
        let taddr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        token::Client::new(&env, &taddr).transfer(&env.current_contract_address(), &user, &shares);
        shares
    }

    pub fn get_market_state(env: Env, market_id: u64) -> MarketState {
        let k = DataKey::Market(market_id);
        env.storage().persistent().get(&k).unwrap()
    }
}
