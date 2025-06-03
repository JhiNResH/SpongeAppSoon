use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct Amm {
    /// Primary key of the AMM
    pub id: Pubkey,

    /// Account that has admin authority over the AMM
    pub admin: Pubkey,

    /// liquidity fee percentage: 100000 = 100%
    pub liquidity_fee: u16, 

    /// Protocol fee percentage of the liquidity fee (0-100)
    /// e.g., 10000 means 100% of liquidity fee goes to protocol
    pub protocol_fee_percentage: u16,
}

impl Amm {
    pub const LEN: usize = 8 + 32 + 32 + 2 + 2;
}

#[account]
#[derive(Default)]
pub struct Pool {
    /// Primary key of the AMM
    pub amm: Pubkey,

    /// Mint of token A
    pub mint_a: Pubkey,

    /// 借贷池中token a的数量
    pub token_a_amount :u64,
    /// 借贷池中token b的数量
    pub token_b_amount :u64,

    pub pool_type :u64,
}

impl Pool {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8+ 8;
}