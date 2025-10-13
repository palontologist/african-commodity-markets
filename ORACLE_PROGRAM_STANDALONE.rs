use anchor_lang::prelude::*;

declare_id!("orac1exxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[program]
pub mod oracle {
    use super::*;

    /// Initialize the oracle
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let oracle_state = &mut ctx.accounts.oracle_state;
        oracle_state.authority = ctx.accounts.authority.key();
        oracle_state.total_prices = 0;
        oracle_state.bump = ctx.bumps.oracle_state;
        
        msg!("Oracle initialized");
        Ok(())
    }

    /// Update price for a commodity
    pub fn update_price(
        ctx: Context<UpdatePrice>,
        commodity: [u8; 32],
        price: u64,
        confidence: u64,
    ) -> Result<()> {
        let price_account = &mut ctx.accounts.price_account;
        let clock = Clock::get()?;
        
        require!(price > 0, ErrorCode::InvalidPrice);
        require!(confidence > 0 && confidence <= 100, ErrorCode::InvalidConfidence);
        
        // Initialize if first time
        if price_account.timestamp == 0 {
            let oracle_state = &mut ctx.accounts.oracle_state;
            oracle_state.total_prices += 1;
        }
        
        price_account.commodity = commodity;
        price_account.price = price;
        price_account.confidence = confidence;
        price_account.timestamp = clock.unix_timestamp;
        price_account.bump = ctx.bumps.price_account;
        
        emit!(PriceUpdated {
            commodity,
            price,
            confidence,
            timestamp: price_account.timestamp,
        });
        
        msg!("Price updated: {} cents, confidence: {}%", price, confidence);
        Ok(())
    }

    /// Get price (can be called via CPI from other programs)
    pub fn get_price(ctx: Context<GetPrice>) -> Result<(u64, u64, i64)> {
        let price_account = &ctx.accounts.price_account;
        let clock = Clock::get()?;
        
        require!(price_account.timestamp > 0, ErrorCode::PriceNotInitialized);
        
        // Check if price is stale (older than 1 hour)
        let age = clock.unix_timestamp - price_account.timestamp;
        if age > 3600 {
            msg!("Warning: Price is {} seconds old", age);
        }
        
        Ok((
            price_account.price,
            price_account.confidence,
            price_account.timestamp,
        ))
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
        seeds = [b"price", &commodity],
        bump
    )]
    pub price_account: Account<'info, PriceAccount>,
    
    #[account(
        mut,
        seeds = [b"oracle_state"],
        bump = oracle_state.bump,
        has_one = authority
    )]
    pub oracle_state: Account<'info, OracleState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetPrice<'info> {
    #[account(
        seeds = [b"price", &price_account.commodity],
        bump = price_account.bump
    )]
    pub price_account: Account<'info, PriceAccount>,
}

#[account]
pub struct OracleState {
    pub authority: Pubkey,      // 32
    pub total_prices: u64,      // 8
    pub bump: u8,               // 1
}

impl OracleState {
    pub const LEN: usize = 32 + 8 + 1;
}

#[account]
pub struct PriceAccount {
    pub commodity: [u8; 32],    // 32 - commodity name/identifier
    pub price: u64,             // 8  - price in cents (e.g., 247 = $2.47)
    pub confidence: u64,        // 8  - confidence percentage (0-100)
    pub timestamp: i64,         // 8  - last update time
    pub bump: u8,               // 1
}

impl PriceAccount {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 1;
}

#[event]
pub struct PriceUpdated {
    pub commodity: [u8; 32],
    pub price: u64,
    pub confidence: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid price: must be greater than 0")]
    InvalidPrice,
    
    #[msg("Invalid confidence: must be between 1-100")]
    InvalidConfidence,
    
    #[msg("Price not initialized for this commodity")]
    PriceNotInitialized,
}
