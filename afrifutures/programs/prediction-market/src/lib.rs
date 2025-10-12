use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("mkt1exxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

// Oracle price account structure (must match oracle program)
#[account]
pub struct PriceAccount {
    pub commodity: [u8; 32],
    pub price: u64,
    pub confidence: u64,
    pub timestamp: i64,
}

#[program]
pub mod prediction_market {
    use super::*;

    /// Initialize the prediction market program
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let market_state = &mut ctx.accounts.market_state;
        market_state.authority = ctx.accounts.authority.key();
        market_state.total_markets = 0;
        market_state.bump = ctx.bumps.market_state;
        
        msg!("Market state initialized");
        Ok(())
    }

    /// Create a new prediction market
    pub fn create_market(
        ctx: Context<CreateMarket>,
        market_id: u64,
        commodity: [u8; 32],
        threshold_price: u64,
        expiry_time: i64,
    ) -> Result<()> {
        let clock = Clock::get()?;
        require!(expiry_time > clock.unix_timestamp, ErrorCode::InvalidExpiryTime);
        
        let market = &mut ctx.accounts.market;
        market.market_id = market_id;
        market.commodity = commodity;
        market.threshold_price = threshold_price;
        market.expiry_time = expiry_time;
        market.creation_time = clock.unix_timestamp;
        market.yes_pool = 0;
        market.no_pool = 0;
        market.resolved = false;
        market.outcome = false;
        market.resolution_time = 0;
        market.oracle_price = 0;
        market.authority = ctx.accounts.authority.key();
        
        let market_state = &mut ctx.accounts.market_state;
        market_state.total_markets += 1;
        
        emit!(MarketCreated {
            market_id,
            commodity,
            threshold_price,
            expiry_time,
            creator: ctx.accounts.authority.key(),
        });
        
        msg!("Market created: id={}, threshold={} cents", market_id, threshold_price);
        Ok(())
    }

    /// Buy YES or NO shares in a market
    pub fn buy_shares(
        ctx: Context<BuyShares>,
        amount: u64,
        is_yes: bool,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let clock = Clock::get()?;
        
        require!(!market.resolved, ErrorCode::MarketResolved);
        require!(clock.unix_timestamp < market.expiry_time, ErrorCode::MarketExpired);
        require!(amount > 0, ErrorCode::InvalidAmount);
        
        // Transfer USDC from user to market vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.market_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        
        // Update position
        let position = &mut ctx.accounts.position;
        if is_yes {
            position.yes_shares += amount;
            market.yes_pool += amount;
        } else {
            position.no_shares += amount;
            market.no_pool += amount;
        }
        position.user = ctx.accounts.user.key();
        position.market_id = market.market_id;
        position.claimed = false;
        
        emit!(SharesPurchased {
            market_id: market.market_id,
            user: ctx.accounts.user.key(),
            is_yes,
            amount,
        });
        
        msg!("Shares purchased: {} {} shares", amount, if is_yes { "YES" } else { "NO" });
        Ok(())
    }

    /// Resolve market using oracle price
    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let clock = Clock::get()?;
        
        // Validations
        require!(
            clock.unix_timestamp >= market.expiry_time,
            ErrorCode::MarketNotExpired
        );
        require!(!market.resolved, ErrorCode::AlreadyResolved);
        
        // Deserialize oracle price data
        let oracle_data = ctx.accounts.price_oracle.try_borrow_data()?;
        let price_account = PriceAccount::try_deserialize(&mut &oracle_data[..])?;
        
        // Check oracle price is not stale
        require!(
            clock.unix_timestamp - price_account.timestamp < 3600,
            ErrorCode::StaleOraclePrice
        );
        
        // Get oracle data
        let actual_price = price_account.price; // in cents: 247 = $2.47
        let threshold = market.threshold_price; // 250 = $2.50
        
        // Determine outcome: did price reach or exceed threshold?
        let outcome = actual_price >= threshold;
        
        // Resolve market
        market.resolved = true;
        market.outcome = outcome;
        market.resolution_time = clock.unix_timestamp;
        market.oracle_price = actual_price;
        
        emit!(MarketResolved {
            market_id: market.market_id,
            outcome,
            oracle_price: actual_price,
            threshold_price: threshold,
            timestamp: market.resolution_time,
        });
        
        msg!(
            "Market resolved: outcome={}, oracle={} cents, threshold={} cents",
            outcome,
            actual_price,
            threshold
        );
        
        Ok(())
    }

    /// Claim winnings after market resolution
    pub fn claim_winnings(
        ctx: Context<ClaimWinnings>,
    ) -> Result<()> {
        let market = &ctx.accounts.market;
        let position = &mut ctx.accounts.position;
        
        require!(market.resolved, ErrorCode::MarketNotResolved);
        require!(!position.claimed, ErrorCode::AlreadyClaimed);
        
        let total_pool = market.yes_pool + market.no_pool;
        let winning_pool = if market.outcome {
            market.yes_pool
        } else {
            market.no_pool
        };
        
        let user_shares = if market.outcome {
            position.yes_shares
        } else {
            position.no_shares
        };
        
        require!(user_shares > 0, ErrorCode::NoWinningShares);
        require!(winning_pool > 0, ErrorCode::InvalidPool);
        
        // Calculate payout: (user_shares / winning_pool) * total_pool
        let payout = (user_shares as u128)
            .checked_mul(total_pool as u128)
            .unwrap()
            .checked_div(winning_pool as u128)
            .unwrap() as u64;
        
        require!(payout > 0, ErrorCode::InvalidPayout);
        
        // Mark as claimed
        position.claimed = true;
        
        // Transfer winnings from vault to user
        // Note: Without PDA, market authority must sign or vault must have delegate
        let cpi_accounts = Transfer {
            from: ctx.accounts.market_vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.market.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, payout)?;
        
        emit!(WinningsClaimed {
            market_id: market.market_id,
            user: ctx.accounts.user.key(),
            payout,
        });
        
        msg!("Winnings claimed: {} USDC", payout);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + MarketState::LEN,
        seeds = [b"market_state"],
        bump
    )]
    pub market_state: Account<'info, MarketState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct CreateMarket<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + PredictionMarket::LEN
    )]
    pub market: Account<'info, PredictionMarket>,
    
    #[account(
        mut,
        seeds = [b"market_state"],
        bump = market_state.bump
    )]
    pub market_state: Account<'info, MarketState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyShares<'info> {
    #[account(mut)]
    pub market: Account<'info, PredictionMarket>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserPosition::LEN,
        seeds = [b"position", market.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub position: Account<'info, UserPosition>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub market_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut)]
    pub market: Account<'info, PredictionMarket>,
    
    /// CHECK: Oracle price account from oracle program - validated by deserializing
    pub price_oracle: AccountInfo<'info>,
    
    /// CHECK: Oracle program ID
    pub oracle_program: AccountInfo<'info>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub market: Account<'info, PredictionMarket>,
    
    #[account(
        mut,
        has_one = user
    )]
    pub position: Account<'info, UserPosition>,
    
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub market_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct MarketState {
    pub authority: Pubkey,          // 32
    pub total_markets: u64,         // 8
    pub bump: u8,                   // 1
}

impl MarketState {
    pub const LEN: usize = 32 + 8 + 1;
}

#[account]
pub struct PredictionMarket {
    pub market_id: u64,             // 8
    pub commodity: [u8; 32],        // 32
    pub threshold_price: u64,       // 8 - Target price in cents
    pub expiry_time: i64,           // 8
    pub creation_time: i64,         // 8
    pub yes_pool: u64,              // 8
    pub no_pool: u64,               // 8
    pub resolved: bool,             // 1
    pub outcome: bool,              // 1 - true if price >= threshold
    pub resolution_time: i64,       // 8
    pub oracle_price: u64,          // 8 - Actual price at resolution
    pub authority: Pubkey,          // 32
}

impl PredictionMarket {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 1 + 1 + 8 + 8 + 32;
}

#[account]
pub struct UserPosition {
    pub user: Pubkey,               // 32
    pub market_id: u64,             // 8
    pub yes_shares: u64,            // 8
    pub no_shares: u64,             // 8
    pub claimed: bool,              // 1
}

impl UserPosition {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 1;
}

#[event]
pub struct MarketCreated {
    pub market_id: u64,
    pub commodity: [u8; 32],
    pub threshold_price: u64,
    pub expiry_time: i64,
    pub creator: Pubkey,
}

#[event]
pub struct SharesPurchased {
    pub market_id: u64,
    pub user: Pubkey,
    pub is_yes: bool,
    pub amount: u64,
}

#[event]
pub struct MarketResolved {
    pub market_id: u64,
    pub outcome: bool,
    pub oracle_price: u64,
    pub threshold_price: u64,
    pub timestamp: i64,
}

#[event]
pub struct WinningsClaimed {
    pub market_id: u64,
    pub user: Pubkey,
    pub payout: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Market has already been resolved")]
    MarketResolved,
    
    #[msg("Market has expired")]
    MarketExpired,
    
    #[msg("Market has not expired yet")]
    MarketNotExpired,
    
    #[msg("Market has already been resolved")]
    AlreadyResolved,
    
    #[msg("Market has not been resolved yet")]
    MarketNotResolved,
    
    #[msg("User has already claimed winnings")]
    AlreadyClaimed,
    
    #[msg("Invalid amount: must be greater than 0")]
    InvalidAmount,
    
    #[msg("Invalid expiry time: must be in the future")]
    InvalidExpiryTime,
    
    #[msg("No winning shares in this position")]
    NoWinningShares,
    
    #[msg("Invalid pool calculation")]
    InvalidPool,
    
    #[msg("Invalid payout calculation")]
    InvalidPayout,
    
    #[msg("Oracle price is stale")]
    StaleOraclePrice,
}
