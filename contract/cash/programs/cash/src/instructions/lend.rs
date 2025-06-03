use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};
use crate::{
    constants::{LENDING_TOKEN_SEED,CASH_TOKEN_SEED,AUTHORITY_SEED},
    state::Pool,
};
use crate::instructions::utils::mint_and_freeze_token;


#[derive(Accounts)]
pub struct Lend<'info> {
    
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

    pub lender: Signer<'info>,

    #[account(
        mut,
        associated_token::mint = pool.mint_a,
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
        init_if_needed,
        payer = payer,
        associated_token::mint = lending_receipt_token_mint,
        associated_token::authority = lender_authority,
    )]
    pub lender_lend_receipt_token: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = cash_token_mint,
        associated_token::authority = lender,
    )]
    pub lender_cash_token: Box<Account<'info, TokenAccount>>,

    /// The account paying for all rents
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Solana ecosystem accounts
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn lend(ctx: Context<Lend>,lender_lending_amount: u64,) -> Result<()> {
    //  todo: 限制lender_lending_amount最小额度
     require!(
         ctx.accounts.lender_token_a.amount >= lender_lending_amount,
         LendError::InsufficientBalance
     );
 
    //  1. 转移 token A 到借贷池
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.lender_token_a.to_account_info(),
                to: ctx.accounts.pool_account_a.to_account_info(),
                authority: ctx.accounts.lender.to_account_info(),
            },
        ),
        lender_lending_amount,
    )?;

     // 2 铸造 lender_lend_receipt_token
     let authority_seeds = &[
         &ctx.accounts.pool.amm.to_bytes(),
         &ctx.accounts.pool.mint_a.key().to_bytes(),
         AUTHORITY_SEED,
         &[ctx.bumps.pool_authority],
     ];
     let signer_seeds = &[&authority_seeds[..]];
     mint_and_freeze_token(
        &ctx.accounts.token_program,
        &ctx.accounts.lending_receipt_token_mint,
        &ctx.accounts.lender_lend_receipt_token,
        &ctx.accounts.pool_authority,
        signer_seeds,
        lender_lending_amount,
    )?;
    
    // 3 铸造 cash
    mint_and_freeze_token(
        &ctx.accounts.token_program,
        &ctx.accounts.cash_token_mint,
        &ctx.accounts.lender_cash_token,
        &ctx.accounts.pool_authority,
        signer_seeds,
        lender_lending_amount*100/120,
    )?;
       
    Ok(())
}

#[error_code]
pub enum LendError {
    #[msg("Existing lending")]
    ExistingLending,
    #[msg("Insufficient balance")]
    InsufficientBalance,
}