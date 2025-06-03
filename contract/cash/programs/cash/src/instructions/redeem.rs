use anchor_lang::prelude::*;
use anchor_spl::{
    token::{self, Mint, Token, TokenAccount, Transfer, Burn},
    associated_token::AssociatedToken,
};
use crate::{
    constants::{AUTHORITY_SEED, LENDING_TOKEN_SEED, CASH_TOKEN_SEED},
    state::Pool,
};



#[derive(Accounts)]
pub struct Redeem<'info> {
    #[account(
        seeds = [
            pool.amm.as_ref(),
            pool.mint_a.key().as_ref(),
        ],
        bump,
    )]
    pub pool: Box<Account<'info, Pool>>,

    /// CHECK: Read only authority
    #[account(
        seeds = [
            pool.amm.as_ref(),
            pool.mint_a.key().as_ref(),
            AUTHORITY_SEED,
        ],
        bump,
    )]
    pub pool_authority: AccountInfo<'info>,

    pub mint_a: Box<Account<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = pool.mint_a,
        associated_token::authority = pool_authority,
    )]
    pub pool_account_a: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [
            pool.amm.as_ref(),
            pool.mint_a.key().as_ref(),
            LENDING_TOKEN_SEED,
        ],
        bump,
        mint::decimals = 6,
        mint::authority = pool_authority,        // mint authority 是 pool_authority
        mint::freeze_authority = pool_authority, // freeze authority 也是 pool_authority
    )]
    pub lending_receipt_token_mint: Box<Account<'info, Mint>>,

    pub lender: Signer<'info>,

    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = lender,
    )]
    pub lender_token_a: Box<Account<'info, TokenAccount>>,

    /// CHECK: Read only authority
    #[account(
        seeds = [
            pool.key().as_ref(),
            lender.key().as_ref(),
            AUTHORITY_SEED,
        ],
        bump,
    )]
    pub lender_authority: AccountInfo<'info>,

    #[account(
        mut,
        associated_token::mint = lending_receipt_token_mint,
        associated_token::authority = lender_authority,
    )]
    pub lender_lend_receipt_token: Box<Account<'info, TokenAccount>>,


    #[account(
        mut,
        seeds = [
            pool.amm.as_ref(),
            pool.mint_a.key().as_ref(),
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
        associated_token::mint = cash_token_mint,
        associated_token::authority = lender,
    )]
    pub lender_cash_token: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub payer: Signer<'info>,

    // 4. Programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,

}

pub fn redeem(ctx: Context<Redeem>) -> Result<()> {
    // 1. 解码 lending receipt token 数量
    let lender_lending_receipt_amount = ctx.accounts.lender_lend_receipt_token.amount;

    let lender_authority_seeds = &[
        &ctx.accounts.pool.key().to_bytes(),
        &ctx.accounts.lender.key().to_bytes(),
        AUTHORITY_SEED,
        &[ctx.bumps.lender_authority],
    ];
    let signer_seeds = &[&lender_authority_seeds[..]];

    // 2. 解冻、销毁 lending receipt token
    token::burn(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.lending_receipt_token_mint.to_account_info(),
                from: ctx.accounts.lender_lend_receipt_token.to_account_info(),
                authority: ctx.accounts.lender_authority.to_account_info(),
            }, 
            signer_seeds,
        ),
        lender_lending_receipt_amount,
    )?;

    // 3. 销毁 cash token
    token::burn(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.cash_token_mint.to_account_info(),
                from: ctx.accounts.lender_cash_token.to_account_info(),
                authority: ctx.accounts.lender.to_account_info(),
            }, 
            signer_seeds,
        ),
        lender_lending_receipt_amount * 100 / 120,
    )?;

    // 4. 提取本金
    let pool_authority_seeds = &[
        ctx.accounts.pool.amm.as_ref(),
        &ctx.accounts.mint_a.key().to_bytes(),
        AUTHORITY_SEED,
        &[ctx.bumps.pool_authority],
    ];
    let pool_signer_seeds = &[&pool_authority_seeds[..]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.pool_account_a.to_account_info(),
                to: ctx.accounts.lender_token_a.to_account_info(),
                authority: ctx.accounts.pool_authority.to_account_info(),
            },
            pool_signer_seeds,
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