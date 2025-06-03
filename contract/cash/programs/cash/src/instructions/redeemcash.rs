use anchor_lang::prelude::*;
use anchor_spl::{
    token::{self, Mint, Token, TokenAccount, Transfer, Burn},
    associated_token::AssociatedToken,
};
use crate::{
    constants::{AUTHORITY_SEED,CASH_TOKEN_SEED,SCASH_TOKEN_SEED,CASH_POOL},
    state::Pool,
};



#[derive(Accounts)]
pub struct RedeemCash<'info> {
    #[account(
        seeds = [
            cash_pool.amm.as_ref(),
            cash_pool.mint_a.key().as_ref(),
            CASH_POOL,
        ],
        bump,
    )]
    pub cash_pool: Box<Account<'info, Pool>>,

    /// CHECK: Read only authority
    #[account(
        seeds = [
            cash_pool.amm.as_ref(),
            cash_pool.mint_a.key().as_ref(),
            AUTHORITY_SEED,
        ],
        bump,
    )]
    pub pool_authority: AccountInfo<'info>,

    #[account(
        mut,
        associated_token::mint = cash_token_mint,
        associated_token::authority = pool_authority,
    )]
    pub pool_account_cash: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [
            cash_pool.amm.as_ref(),
            cash_pool.mint_a.key().as_ref(),
            CASH_TOKEN_SEED,
        ],
        bump,
        mint::decimals = 6,
        mint::authority = pool_authority,        // mint authority 是 pool_authority
        mint::freeze_authority = pool_authority, // freeze authority 也是 pool_authority
    )]
    pub cash_token_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        seeds = [
            cash_pool.amm.as_ref(),
            cash_pool.mint_a.key().as_ref(),
            SCASH_TOKEN_SEED,
        ],
        bump,
        mint::decimals = 6,
        mint::authority = pool_authority,        // mint authority 是 pool_authority
        mint::freeze_authority = pool_authority, // freeze authority 也是 pool_authority
    )]
    pub s_cash_token_mint: Box<Account<'info, Mint>>,

    pub lender: Signer<'info>,

    #[account(
        mut,
        associated_token::mint = cash_token_mint,
        associated_token::authority = lender,
    )]
    pub lender_cash_token: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = s_cash_token_mint,
        associated_token::authority = lender,
    )]
    pub lender_scash_token: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub payer: Signer<'info>,

    // 4. Programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,

}

pub fn redeem_cash(ctx: Context<RedeemCash>) -> Result<()> {
    // 1. 解码 lending receipt token 数量
    let lender_lending_receipt_amount = ctx.accounts.lender_scash_token.amount;

    let authority_seeds = &[
        &ctx.accounts.cash_pool.amm.to_bytes(),
        &ctx.accounts.cash_pool.mint_a.key().to_bytes(),
        AUTHORITY_SEED,
        &[ctx.bumps.pool_authority],
    ];
    let signer_seeds = &[&authority_seeds[..]];
   
    // 2. 解冻、销毁 lending receipt token
    token::burn(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.s_cash_token_mint.to_account_info(),
                from: ctx.accounts.lender_scash_token.to_account_info(),
                authority: ctx.accounts.lender.to_account_info(),
            }, 
            signer_seeds,
        ),
        lender_lending_receipt_amount,
    )?;

    // 4. 提取本金
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.pool_account_cash.to_account_info(),
                to: ctx.accounts.lender_cash_token.to_account_info(),
                authority: ctx.accounts.pool_authority.to_account_info(),
            },
            signer_seeds,
        ),
        lender_lending_receipt_amount,
    )?;

    Ok(())
}

#[error_code]
pub enum RedeemError {
    #[msg("Calculation error")]
    CalculationError,
}