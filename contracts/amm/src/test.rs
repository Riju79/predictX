#![cfg(test)]
use super::*;
use soroban_sdk::Env;

#[test]
fn test_amm_placeholder() {
    let env = Env::default();
    let contract_id = env.register(AMM, ());
    let client = AMMClient::new(&env, &contract_id);
    assert_eq!(client.name(), String::from_str(&env, "amm"));
}
