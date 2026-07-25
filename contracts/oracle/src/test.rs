#![cfg(test)]

use super::*;
use soroban_sdk::{vec, Env, Address, testutils::{Address as _, Ledger as _}, IntoVal};

mod market_contract {
    soroban_sdk::contractimport!(file = "../../target/wasm32v1-none/release/market.wasm");
}

#[test]
fn test_oracle_lifecycle_multisig() {
    let env = Env::default();
    env.mock_all_auths();

    // 1. Set up Market contract from compiled WASM
    let market_contract_id = env.register_contract_wasm(None, market_contract::WASM);
    let market_client = market_contract::Client::new(&env, &market_contract_id);
    
    // Set up mock token and initialize market
    let token_admin = Address::generate(&env);
    let token_address = env.register_stellar_asset_contract(token_admin);
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    market_client.initialize(&admin, &token_address, &Address::generate(&env), &treasury);

    // Create a market instance
    let market_id = 1u64;
    let oracle_id = env.register(Oracle, ()); // Register Oracle contract
    let creator = Address::generate(&env);
    market_client.create_market(&creator, &market_id, &1000, &oracle_id);

    // 2. Set up Oracle contract
    let oracle_client = OracleClient::new(&env, &oracle_id);
    let committee = vec![
        &env,
        Address::generate(&env),
        Address::generate(&env),
        Address::generate(&env),
        Address::generate(&env),
        Address::generate(&env),
    ];
    let challenge_window = 3600u64; // 1 hour
    oracle_client.initialize(&market_contract_id, &committee, &challenge_window);

    // 3. Propose Outcome (anyone can call)
    let proposer = Address::generate(&env);
    env.ledger().set_timestamp(100);
    oracle_client.propose_outcome(&market_id, &Outcome::Yes, &proposer);

    // 4. Test multisig approval (3-of-5)
    // First approval
    oracle_client.approve(&market_id, &committee.get(0).unwrap());
    let state = market_client.get_market_state(&market_id);
    assert_eq!(state.resolved, false); // Not resolved yet (1/3 approvals)

    // Second approval
    oracle_client.approve(&market_id, &committee.get(1).unwrap());
    let state = market_client.get_market_state(&market_id);
    assert_eq!(state.resolved, false); // Not resolved yet (2/3 approvals)

    // Third approval (should trigger auto-finalization and resolve the market)
    oracle_client.approve(&market_id, &committee.get(2).unwrap());
    let state = market_client.get_market_state(&market_id);
    assert_eq!(state.resolved, true); // Auto-resolved!
    assert_eq!(state.winning_outcome, market_contract::Outcome::Yes);
}

#[test]
fn test_oracle_lifecycle_challenge_window_elapsed() {
    let env = Env::default();
    env.mock_all_auths();

    let market_contract_id = env.register_contract_wasm(None, market_contract::WASM);
    let market_client = market_contract::Client::new(&env, &market_contract_id);
    let token_admin = Address::generate(&env);
    let token_address = env.register_stellar_asset_contract(token_admin);
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    market_client.initialize(&admin, &token_address, &Address::generate(&env), &treasury);

    let market_id = 2u64;
    let oracle_id = env.register(Oracle, ());
    let creator = Address::generate(&env);
    market_client.create_market(&creator, &market_id, &2000, &oracle_id);

    let oracle_client = OracleClient::new(&env, &oracle_id);
    let committee = vec![
        &env,
        Address::generate(&env),
        Address::generate(&env),
        Address::generate(&env),
        Address::generate(&env),
        Address::generate(&env),
    ];
    let challenge_window = 100u64;
    oracle_client.initialize(&market_contract_id, &committee, &challenge_window);

    let proposer = Address::generate(&env);
    env.ledger().set_timestamp(100);
    oracle_client.propose_outcome(&market_id, &Outcome::No, &proposer);

    // Move time past challenge window (100 + 100 = 200)
    env.ledger().set_timestamp(201);
    
    // Now anyone can finalize
    oracle_client.finalize(&market_id);
    let state = market_client.get_market_state(&market_id);
    assert_eq!(state.resolved, true);
    assert_eq!(state.winning_outcome, market_contract::Outcome::No);
}

#[test]
#[should_panic(expected = "Cannot finalize yet: either wait for window to elapse without disputes, or gather 3 approvals")]
fn test_oracle_finalize_fails_before_window_or_approvals() {
    let env = Env::default();
    env.mock_all_auths();

    let market_contract_id = env.register_contract_wasm(None, market_contract::WASM);
    let market_client = market_contract::Client::new(&env, &market_contract_id);
    let token_admin = Address::generate(&env);
    let token_address = env.register_stellar_asset_contract(token_admin);
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    market_client.initialize(&admin, &token_address, &Address::generate(&env), &treasury);

    let market_id = 3u64;
    let oracle_id = env.register(Oracle, ());
    let creator = Address::generate(&env);
    market_client.create_market(&creator, &market_id, &2000, &oracle_id);

    let oracle_client = OracleClient::new(&env, &oracle_id);
    let committee = vec![
        &env,
        Address::generate(&env),
        Address::generate(&env),
        Address::generate(&env),
        Address::generate(&env),
        Address::generate(&env),
    ];
    let challenge_window = 100u64;
    oracle_client.initialize(&market_contract_id, &committee, &challenge_window);

    let proposer = Address::generate(&env);
    env.ledger().set_timestamp(100);
    oracle_client.propose_outcome(&market_id, &Outcome::Yes, &proposer);

    // Call approve once
    oracle_client.approve(&market_id, &committee.get(0).unwrap());

    // Try to finalize (fails because 1 approval < 3, and time window has not elapsed)
    oracle_client.finalize(&market_id);
}

#[test]
fn test_oracle_disputed_path() {
    let env = Env::default();
    env.mock_all_auths();

    let market_contract_id = env.register_contract_wasm(None, market_contract::WASM);
    let market_client = market_contract::Client::new(&env, &market_contract_id);
    let token_admin = Address::generate(&env);
    let token_address = env.register_stellar_asset_contract(token_admin);
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    market_client.initialize(&admin, &token_address, &Address::generate(&env), &treasury);

    let market_id = 4u64;
    let oracle_id = env.register(Oracle, ());
    let creator = Address::generate(&env);
    market_client.create_market(&creator, &market_id, &2000, &oracle_id);

    let oracle_client = OracleClient::new(&env, &oracle_id);
    let committee = vec![
        &env,
        Address::generate(&env),
        Address::generate(&env),
        Address::generate(&env),
        Address::generate(&env),
        Address::generate(&env),
    ];
    let challenge_window = 100u64;
    oracle_client.initialize(&market_contract_id, &committee, &challenge_window);

    let proposer = Address::generate(&env);
    env.ledger().set_timestamp(100);
    oracle_client.propose_outcome(&market_id, &Outcome::Yes, &proposer);

    // Dispute outcome before window elapses
    let disputer = Address::generate(&env);
    env.ledger().set_timestamp(150);
    oracle_client.dispute_outcome(&market_id, &disputer);

    // Move time past challenge window (100 + 100 = 200)
    env.ledger().set_timestamp(201);

    // Trying to finalize should fail because it is disputed, even though the window has elapsed.
    let result = env.try_invoke_contract::<(), soroban_sdk::Error>(
        &oracle_id,
        &soroban_sdk::Symbol::new(&env, "finalize"),
        soroban_sdk::vec![&env, market_id.into_val(&env)],
    );
    assert!(result.is_err()); // Finalization fails under dispute

    // Now, committee approves to reach 3 approvals to resolve the dispute
    oracle_client.approve(&market_id, &committee.get(0).unwrap());
    oracle_client.approve(&market_id, &committee.get(1).unwrap());
    oracle_client.approve(&market_id, &committee.get(2).unwrap()); // Reaches 3 approvals -> auto-finalizes

    let state = market_client.get_market_state(&market_id);
    assert_eq!(state.resolved, true);
    assert_eq!(state.winning_outcome, market_contract::Outcome::Yes);
}
