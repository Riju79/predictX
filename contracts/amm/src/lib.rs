#![no_std]
use soroban_sdk::{contract, contractimpl, Env, String};

#[contract]
pub struct AMM;

#[contractimpl]
impl AMM {
    pub fn name(env: Env) -> String {
        String::from_str(&env, "amm")
    }
}

#[cfg(test)]
mod test;
