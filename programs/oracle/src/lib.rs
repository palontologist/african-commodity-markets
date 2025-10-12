use anchor_lang::prelude::*;

declare_id!("ora1exxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[program]
pub mod oracle {
    use super::*;

    /// Initialize the oracle state
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let oracle_state = &mut ctx.accounts.oracle_state;
        oracle_state.authority = ctx.accounts.authority.key();
        oracle_state.total_commodities = 0;
        oracle_state.bump = ctx.bumps.oracle_state;
        
        msg!("Oracle initialized with authority: {}", oracle_state.authority);
        Ok(())
    }

    /// Update commodity price (called by authorized oracle)
    pub fn update_price(
        ctx: Context<UpdatePrice>,
        commodity: [u8; 32],
        price: u64,
        confidence: u8,
    ) -> Result<()> {
        require!(confidence <= 100, ErrorCode::InvalidConfidence);
        
        let price_account = &mut ctx.accounts.price_account;
        let clock = Clock::get()?;
        
        price_account.commodity = commodity;
        price_account.price = price;
        price_account.confidence = confidence;
        price_account.timestamp = clock.unix_timestamp;
        price_account.last_updater = ctx.accounts.authority.key();
        price_account.update_count += 1;
        price_account.bump = ctx.bumps.price_account;
        
        emit!(PriceUpdated {
            commodity,
            price,
            confidence,
            timestamp: clock.unix_timestamp,
            updater: ctx.accounts.authority.key(),
        });
        
        msg!("Price updated for commodity: price={} cents, confidence={}%", price, confidence);
        Ok(())
    }

    /// Get price for CPI calls from other programs
    pub fn get_price(
        ctx: Context<GetPrice>,
    ) -> Result<u64> {
        let price_account = &ctx.accounts.price_account;
        require!(!price_account.is_stale()?, ErrorCode::StalePrice);
        Ok(price_account.price)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + OracleState::LEN,
        seeds = [b"oracle_state"],
        bump
    )]
    pub oracle_state: Account<'info, OracleState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(commodity: [u8; 32])]
pub struct UpdatePrice<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + PriceAccount::LEN,
        seeds = [b"price", commodity.as_ref()],
        bump
    )]
    pub price_account: Account<'info, PriceAccount>,
    
    #[account(
        seeds = [b"oracle_state"],
        bump = oracle_state.bump,
        has_one = authority @ ErrorCode::Unauthorized
    )]
    pub oracle_state: Account<'info, OracleState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetPrice<'info> {
    #[account(
        seeds = [b"price", price_account.commodity.as_ref()],
        bump = price_account.bump
    )]
    pub price_account: Account<'info, PriceAccount>,
}

#[account]
pub struct OracleState {
    pub authority: Pubkey,          // 32
    pub total_commodities: u32,     // 4
    pub bump: u8,                   // 1
}

impl OracleState {
    pub const LEN: usize = 32 + 4 + 1;
}

#[account]
pub struct PriceAccount {
    pub commodity: [u8; 32],        // 32 - "COFFEE", "TEA", etc.
    pub price: u64,                 // 8 - Price in cents (247 = $2.47)
    pub confidence: u8,             // 1 - Confidence 0-100
    pub timestamp: i64,             // 8 - Last update timestamp
    pub last_updater: Pubkey,       // 32
    pub update_count: u64,          // 8
    pub bump: u8,                   // 1
}

impl PriceAccount {
    pub const LEN: usize = 32 + 8 + 1 + 8 + 32 + 8 + 1;
    
    /// Check if price is stale (older than 1 hour)
    pub fn is_stale(&self) -> Result<bool> {
        let clock = Clock::get()?;
        let age = clock.unix_timestamp - self.timestamp;
        Ok(age > 3600) // 1 hour
    }
}

#[event]
pub struct PriceUpdated {
    pub commodity: [u8; 32],
    pub price: u64,
    pub confidence: u8,
    pub timestamp: i64,
    pub updater: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized: Only oracle authority can update prices")]
    Unauthorized,
    
    #[msg("Invalid confidence: must be 0-100")]
    InvalidConfidence,
    
    #[msg("Stale price: oracle data is too old")]
    StalePrice,
}
