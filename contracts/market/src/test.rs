#![cfg(test)]

use super::*;
use soroban_sdk::{Env, Address, testutils::{Address as _, Ledger as _}, token};

#[test]
fn test_market_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    // Register market contract
    let contract_id = env.register(Market, ());
    let client = MarketClient::new(&env, &contract_id);

    // Set up Stellar Asset Contract (SAC) token
    let token_admin = Address::generate(&env);
    let token_address = env.register_stellar_asset_contract(token_admin.clone());
    let token_admin_client = token::StellarAssetClient::new(&env, &token_address);
    let token_client = token::Client::new(&env, &token_address);

    // Initialize market contract and fund initial pool liquidity backing
    let factory_mock = Address::generate(&env);
    client.initialize(&token_address, &factory_mock);
    token_admin_client.mint(&contract_id, &1_000_000_000);

    // Create a market
    let market_id = 1u64;
    let resolution_time = 1000u64;
    let oracle = Address::generate(&env);
    client.create_market(&market_id, &resolution_time, &oracle);

    // Create user and mint tokens
    let user = Address::generate(&env);
    token_admin_client.mint(&user, &10_000_000_000); // 10,000 units
    assert_eq!(token_client.balance(&user), 10_000_000_000);

    // Set ledger timestamp
    env.ledger().set_timestamp(500);

    // Buy YES shares
    // Reserves are (1B, 1B). User pays 100M (100 units).
    // shares_out = (1B * 100M) / (1B + 100M) = 90,909,090
    // total YES = payment + shares_out = 190,909,090
    let bought = client.buy_shares(&user, &market_id, &Outcome::Yes, &100_000_000);
    assert_eq!(bought, 190_909_090);

    // Check user balance and reserves
    assert_eq!(client.get_balance(&user, &market_id, &Outcome::Yes), 190_909_090);
    assert_eq!(client.get_balance(&user, &market_id, &Outcome::No), 0);
    
    let state = client.get_market_state(&market_id);
    assert_eq!(state.yes_reserves, 1_000_000_000 - 90_909_090);
    assert_eq!(state.no_reserves, 1_100_000_000);

    // Sell YES shares (partial)
    // User sells 90,909,090 YES shares.
    // collateral_out = (state.no_reserves * shares) / (state.yes_reserves + shares)
    // = (1.1B * 90.9M) / (909M + 90.9M) = 100,000,000
    let sold = client.sell_shares(&user, &market_id, &Outcome::Yes, &90_909_090);
    assert_eq!(sold, 99_999_999);

    // User should have 100M YES remaining, and token balance updated (minus rounding diff)
    assert_eq!(client.get_balance(&user, &market_id, &Outcome::Yes), 100_000_000);
    assert_eq!(token_client.balance(&user), 9_999_999_999);

    // Time passes past resolution time
    env.ledger().set_timestamp(1500);

    // Lock market
    client.lock_market(&market_id);
    let state = client.get_market_state(&market_id);
    assert_eq!(state.status, MarketStatus::Locked);

    // Resolve market
    client.resolve_market(&market_id, &Outcome::Yes);
    let state = client.get_market_state(&market_id);
    assert_eq!(state.status, MarketStatus::Resolved);
    assert_eq!(state.resolved, true);
    assert_eq!(state.winning_outcome, Outcome::Yes);

    // Claim winnings
    // User has 100,000,000 YES shares. Since YES won, they get 100,000,000 tokens back.
    let before_balance = token_client.balance(&user);
    let claimed = client.claim_winnings(&user, &market_id);
    assert_eq!(claimed, 100_000_000);
    assert_eq!(token_client.balance(&user), before_balance + 100_000_000);
    assert_eq!(client.get_balance(&user, &market_id, &Outcome::Yes), 0);
}

#[test]
#[should_panic]
fn test_resolve_market_unauthorized_oracle() {
    let env = Env::default();
    
    let contract_id = env.register(Market, ());
    let client = MarketClient::new(&env, &contract_id);

    let token_address = Address::generate(&env);
    let factory_mock = Address::generate(&env);
    client.initialize(&token_address, &factory_mock);

    let market_id = 1u64;
    let oracle = Address::generate(&env);
    client.create_market(&market_id, &1000, &oracle);

    // Call resolve_market without oracle authorization -> should panic
    client.resolve_market(&market_id, &Outcome::Yes);
}
