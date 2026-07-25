#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PoolReserves {
    pub yes_reserves: i128,
    pub no_reserves: i128,
    pub total_lp_shares: i128,
    pub fee_bps: u32,
}

#[contracttype]
pub enum DataKey {
    Admin,
    FeeBps,
    Pool(u64),
    LpBalance(Address, u64),
}

#[contract]
pub struct AMM;

#[contractimpl]
impl AMM {
    /// Initialize the AMM contract with admin and default fee in BPS (e.g. 30 = 0.3%)
    pub fn initialize(env: Env, admin: Address, fee_bps: u32) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::FeeBps, &fee_bps);
    }

    /// Read AMM protocol identifier
    pub fn name(env: Env) -> String {
        String::from_str(&env, "PredictX LMSR-CPMM AMM v1.0")
    }

    /// Calculate outcome probability in BPS (0 to 10,000 basis points)
    /// Price of YES = no_reserves / (yes_reserves + no_reserves) * 10000
    pub fn calculate_price(env: Env, yes_reserves: i128, no_reserves: i128, is_yes: bool) -> u32 {
        if yes_reserves <= 0 || no_reserves <= 0 {
            return 5000; // Default 50% if uninitialized
        }
        let total = yes_reserves + no_reserves;
        if is_yes {
            ((no_reserves * 10000) / total) as u32
        } else {
            ((yes_reserves * 10000) / total) as u32
        }
    }

    /// Calculate shares received for a buy order under constant-product formula (x*y=k)
    /// Also returns protocol fee and estimated price impact in BPS
    pub fn calculate_buy(
        env: Env,
        yes_reserves: i128,
        no_reserves: i128,
        payment: i128,
        is_yes: bool,
        fee_bps: u32,
    ) -> (i128, i128, u32) {
        if payment <= 0 || yes_reserves <= 0 || no_reserves <= 0 {
            panic!("Invalid parameters for AMM calculation");
        }

        let fee = (payment * (fee_bps as i128)) / 10000;
        let net_payment = payment - fee;

        let shares_out = if is_yes {
            (yes_reserves * net_payment) / (no_reserves + net_payment) + net_payment
        } else {
            (no_reserves * net_payment) / (yes_reserves + net_payment) + net_payment
        };

        // Price impact estimation = (payment * 10000) / total_reserves
        let total_reserves = yes_reserves + no_reserves;
        let price_impact_bps = ((payment * 10000) / total_reserves) as u32;

        (shares_out, fee, price_impact_bps)
    }

    /// Calculate collateral payout for a sell order
    pub fn calculate_sell(
        env: Env,
        yes_reserves: i128,
        no_reserves: i128,
        shares: i128,
        is_yes: bool,
        fee_bps: u32,
    ) -> (i128, i128) {
        if shares <= 0 || yes_reserves <= 0 || no_reserves <= 0 {
            panic!("Invalid parameters for AMM calculation");
        }

        let gross_payout = if is_yes {
            (no_reserves * shares) / (yes_reserves + shares)
        } else {
            (yes_reserves * shares) / (no_reserves + shares)
        };

        let fee = (gross_payout * (fee_bps as i128)) / 10000;
        let net_payout = gross_payout - fee;

        (net_payout, fee)
    }

    /// Read pool reserves for market
    pub fn get_pool(env: Env, market_id: u64) -> PoolReserves {
        env.storage().persistent().get(&DataKey::Pool(market_id))
            .unwrap_or(PoolReserves {
                yes_reserves: 1_000_000_000,
                no_reserves: 1_000_000_000,
                total_lp_shares: 1_000_000_000,
                fee_bps: 30,
            })
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn test_amm_price_calculation() {
        let env = Env::default();
        let p_yes = AMM::calculate_price(env.clone(), 1000, 1000, true);
        assert_eq!(p_yes, 5000); // 50%

        let (shares, fee, impact) = AMM::calculate_buy(env.clone(), 1000, 1000, 10_000, true, 30);
        assert!(shares > 0);
        assert!(fee > 0);
    }
}
