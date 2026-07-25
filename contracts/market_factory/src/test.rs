#![cfg(test)]

use super::*;
use soroban_sdk::{vec, Env, Symbol, Address, Vec, testutils::{Address as _, Ledger as _, Events as _}};

mod market_contract {
    soroban_sdk::contractimport!(file = "../../target/wasm32v1-none/release/market.wasm");
}

fn setup_factory_and_market(env: &Env) -> (MarketFactoryClient<'static>, Address) {
    // 1. Register Market contract from WASM
    let market_id = env.register_contract_wasm(None, market_contract::WASM);
    let market_client = market_contract::Client::new(env, &market_id);
    let token_address = env.register_stellar_asset_contract(Address::generate(env));
    
    // 2. Register Factory
    let factory_id = env.register(MarketFactory, ());
    let factory_client = MarketFactoryClient::new(env, &factory_id);

    // 3. Initialize both
    let admin = Address::generate(env);
    let treasury = Address::generate(env);
    market_client.initialize(&admin, &token_address, &factory_id, &treasury);
    factory_client.initialize(&market_id);

    (factory_client, factory_id)
}

#[test]
fn test_create_market_success() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, contract_id) = setup_factory_and_market(&env);

    // Create test accounts
    let creator = Address::generate(&env);
    let oracle = Address::generate(&env);
    
    // Set ledger timestamp
    env.ledger().set_timestamp(1000);

    // Create market
    let question = Symbol::new(&env, "Will_BTC_reach_100k");
    let resolution_time = 2000;
    
    let market_id = client.create_market(&creator, &question, &resolution_time, &oracle);
    assert_eq!(market_id, 1);

    // Fetch and check metadata
    let market = client.get_market(&1);
    assert_eq!(market.id, 1);
    assert_eq!(market.creator, creator);
    assert_eq!(market.question, question);
    assert_eq!(market.resolution_time, resolution_time);
    assert_eq!(market.oracle_id, oracle);
    assert_eq!(market.resolved, false);
    assert_eq!(market.winning_outcome, None);

    // Verify list_markets
    let list = client.list_markets();
    assert_eq!(list, vec![&env, 1]);
}

#[test]
#[should_panic(expected = "resolution_time must be in the future")]
fn test_create_market_past_resolution_time_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, _) = setup_factory_and_market(&env);

    let creator = Address::generate(&env);
    let oracle = Address::generate(&env);

    // Set ledger timestamp
    env.ledger().set_timestamp(1000);

    let question = Symbol::new(&env, "Will_BTC_reach_100k");
    
    // Past resolution time should fail
    client.create_market(&creator, &question, &500, &oracle);
}

#[test]
#[should_panic(expected = "resolution_time must be in the future")]
fn test_create_market_present_resolution_time_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, _) = setup_factory_and_market(&env);

    let creator = Address::generate(&env);
    let oracle = Address::generate(&env);

    // Set ledger timestamp
    env.ledger().set_timestamp(1000);

    let question = Symbol::new(&env, "Will_BTC_reach_100k");
    
    // Equal to current time should fail
    client.create_market(&creator, &question, &1000, &oracle);
}
