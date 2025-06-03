use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use crate::{
    constants::{AUTHORITY_SEED, LENDING_TOKEN_SEED,CASH_TOKEN_SEED,SCASH_TOKEN_SEED},
    state::{Amm, Pool},
};

#[derive(Accounts)]
pub struct CreatePool1<'info> {
    #[account(
        seeds = [
            amm.id.as_ref()
        ],
        bump,
    )]
    pub amm: Box<Account<'info, Amm>>,

    pub mint_a: Box<Account<'info, Mint>>,
    
    #[account(
        init,
        payer = payer,
        space = Pool::LEN,
        seeds = [
            amm.key().as_ref(),
            mint_a.key().as_ref(),
        ],
        bump,
    )]
    pub pool: Box<Account<'info, Pool>>,

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

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint_a,
        associated_token::authority = pool_authority,
    )]
    pub pool_account_a: Box<Account<'info, TokenAccount>>,
    
    #[account(
        init,
        payer = payer,
        seeds = [
            amm.key().as_ref(),
            mint_a.key().as_ref(),
            LENDING_TOKEN_SEED,
        ],
        bump,
        mint::decimals = 6,
        mint::authority = pool_authority,
        mint::freeze_authority = pool_authority,
    )]
    pub lending_receipt_token_mint: Box<Account<'info, Mint>>,
        
    #[account(
        init,
        payer = payer,
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
        seeds = [
            amm.key().as_ref(),
            mint_a.key().as_ref(),
            SCASH_TOKEN_SEED,
        ],
        bump,
        mint::decimals = 6,
        mint::authority = pool_authority,
        mint::freeze_authority = pool_authority,
    )]
    pub s_cash_token_mint: Box<Account<'info, Mint>>,

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


pub fn create_pool_1(ctx: Context<CreatePool1>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    pool.amm = ctx.accounts.amm.key();
    pool.mint_a = ctx.accounts.mint_a.key();
    pool.pool_type = 0;

    Ok(())
}

#[error_code]
pub enum PoolError {
    #[msg("Invalid fee")]
    InvalidFee,
}