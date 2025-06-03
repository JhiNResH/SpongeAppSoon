use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use crate::{
    constants::{AUTHORITY_SEED, CASH_POOL,CASH_TOKEN_SEED},
    state::{Amm, Pool},
};

#[derive(Accounts)]
pub struct CreateCashPool<'info> {
    #[account(
        seeds = [
            amm.id.as_ref()
        ],
        bump,
    )]
    pub amm: Box<Account<'info, Amm>>,

    pub mint_a: Box<Account<'info, Mint>>,

    #[account(
        mut,
        seeds = [
            amm.key().as_ref(),
            mint_a.key().as_ref(),
            CASH_TOKEN_SEED,
        ],
        bump,
        mint::decimals = 6,
        mint::authority = pool_authority,
        mint::freeze_authority = pool_authority,
    )]
    pub cash_token_mint: Box<Account<'info, Mint>>,
    
    #[account(
        init,
        payer = payer,
        space = Pool::LEN,
        seeds = [
            amm.key().as_ref(),
            mint_a.key().as_ref(),
            CASH_POOL,
        ],
        bump,
    )]
    pub cash_pool: Box<Account<'info, Pool>>,

    /// CHECK: Read only authority
    #[account(
        seeds = [
            amm.key().as_ref(),
            mint_a.key().as_ref(),
            AUTHORITY_SEED,
        ],
        bump,
    )]
    pub pool_authority: AccountInfo<'info>,

    /// CHECK: Admin account from AMM state
    #[account(
        constraint = admin.key() == amm.admin
    )]
    pub admin: AccountInfo<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}


pub fn create_cash_pool(ctx: Context<CreateCashPool>) -> Result<()> {
    let cash_pool = &mut ctx.accounts.cash_pool;
    cash_pool.amm = ctx.accounts.amm.key();
    cash_pool.mint_a = ctx.accounts.mint_a.key();
    cash_pool.pool_type = 1;

    Ok(())
}

#[error_code]
pub enum PoolError {
    #[msg("Invalid fee")]
    InvalidFee,
}