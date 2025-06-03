#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
mod constants;
mod instructions;
mod state;

declare_id!("EYCdeLWKH7F5JejES1aPvGBqFaT9S1e2roEThq1y9FAR");


#[program]
pub mod cash {
    pub use super::instructions::*;
    use super::*;

    pub fn create_amm(ctx: Context<CreateAmm>, id: Pubkey) -> Result<()> {
        instructions::create_amm(ctx, id)
    }

    pub fn create_pool_1(ctx: Context<CreatePool1>) -> Result<()> {
        instructions::create_pool_1(ctx)
    }

    pub fn lend(ctx: Context<Lend>, user_lending_amount: u64) -> Result<()> {
        instructions::lend(ctx, user_lending_amount)
    }

    pub fn redeem(ctx: Context<Redeem>) -> Result<()> {
        instructions::redeem(ctx)
    }

    pub fn create_cash_pool(ctx: Context<CreateCashPool>) -> Result<()> {
        instructions::create_cash_pool(ctx)
    }

    pub fn lend_cash(ctx: Context<LendCash>, user_lending_amount: u64) -> Result<()> {
        instructions::lend_cash(ctx, user_lending_amount)
    }

    pub fn redeem_cash(ctx: Context<RedeemCash>) -> Result<()> {
        instructions::redeem_cash(ctx)
    }

}
