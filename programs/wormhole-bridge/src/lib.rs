use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("4kXhKyaVrRq2M1XmfwnhskKn32puw5xiE9jQPQ9RXvmK");

/// Solana side of Afrifutures Wormhole Bridge (Simplified for Playground)
/// This version works without wormhole-anchor-sdk for easier deployment
/// 
/// Handles:
/// - Receiving USDC from Polygon via Wormhole
/// - Auto-staking in Solana prediction markets
/// - Bridging $AFF tokens from Polygon
/// - Cross-chain governance voting
#[program]
pub mod afrifutures_bridge {
    use super::*;

    /// Initialize the bridge
    pub fn initialize(
        ctx: Context<Initialize>,
        polygon_emitter: [u8; 32],
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge_state;
        bridge.authority = ctx.accounts.authority.key();
        bridge.polygon_emitter = polygon_emitter;
        bridge.nonce = 0;
        bridge.total_usdc_bridged = 0;
        bridge.total_aff_bridged = 0;
        bridge.total_messages = 0;
        bridge.paused = false;
        
        msg!("Afrifutures Bridge initialized");
        msg!("Authority: {}", bridge.authority);
        msg!("Polygon Emitter: {:?}", polygon_emitter);
        Ok(())
    }

    /// Receive USDC from Polygon and optionally auto-stake
    /// This is a simplified version that processes pre-verified messages
    pub fn receive_usdc(
        ctx: Context<ReceiveTokens>,
        amount: u64,
        sender: [u8; 32],
        market_id: Option<u64>,
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge_state;
        require!(!bridge.paused, BridgeError::BridgePaused);
        require!(amount > 0, BridgeError::InvalidAmount);
        
        // Transfer USDC from bridge to user
        let bridge_bump = ctx.bumps.bridge_state;
        let seeds = &[b"bridge".as_ref(), &[bridge_bump]];
        let signer = &[&seeds[..]];
        
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.bridge_token_account.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: bridge.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;
        
        bridge.total_usdc_bridged += amount;
        bridge.total_messages += 1;
        
        // If auto-stake is enabled, stake in specified market
        if let Some(market) = market_id {
            msg!("Auto-staking {} USDC in market {}", amount, market);
            // TODO: Call prediction market stake instruction
        }
        
        emit!(MessageReceived {
            message_type: MessageType::BridgeUSDC,
            sender,
            amount,
            market_id,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Received {} USDC from Polygon", amount);
        Ok(())
    }

    /// Receive AFF tokens from Polygon
    pub fn receive_aff(
        ctx: Context<ReceiveTokens>,
        amount: u64,
        sender: [u8; 32],
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge_state;
        require!(!bridge.paused, BridgeError::BridgePaused);
        require!(amount > 0, BridgeError::InvalidAmount);
        
        // Transfer AFF from bridge to user
        let bridge_bump = ctx.bumps.bridge_state;
        let seeds = &[b"bridge".as_ref(), &[bridge_bump]];
        let signer = &[&seeds[..]];
        
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.bridge_token_account.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: bridge.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;
        
        bridge.total_aff_bridged += amount;
        bridge.total_messages += 1;
        
        emit!(MessageReceived {
            message_type: MessageType::BridgeAFF,
            sender,
            amount,
            market_id: None,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Received {} AFF from Polygon", amount);
        Ok(())
    }

    /// Send USDC to Polygon (bridge back)
    pub fn send_usdc_to_polygon(
        ctx: Context<SendToPolygon>,
        amount: u64,
        polygon_recipient: [u8; 20],
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge_state;
        require!(!bridge.paused, BridgeError::BridgePaused);
        require!(amount > 0, BridgeError::InvalidAmount);
        
        // Transfer USDC from user to bridge
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.bridge_token_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;
        
        bridge.nonce += 1;
        
        emit!(MessageSent {
            sequence: bridge.nonce,
            message_type: MessageType::SettlePosition,
            recipient: polygon_recipient,
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Sent {} USDC to Polygon recipient: {:?}", amount, polygon_recipient);
        Ok(())
    }

    /// Send AFF tokens to Polygon
    pub fn send_aff_to_polygon(
        ctx: Context<SendToPolygon>,
        amount: u64,
        polygon_recipient: [u8; 20],
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge_state;
        require!(!bridge.paused, BridgeError::BridgePaused);
        require!(amount > 0, BridgeError::InvalidAmount);
        
        // Transfer AFF from user to bridge
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.bridge_token_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;
        
        bridge.nonce += 1;
        
        emit!(MessageSent {
            sequence: bridge.nonce,
            message_type: MessageType::BridgeAFF,
            recipient: polygon_recipient,
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Sent {} AFF to Polygon recipient: {:?}", amount, polygon_recipient);
        Ok(())
    }

    /// Pause/unpause bridge (admin only)
    pub fn set_pause(ctx: Context<SetPause>, paused: bool) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge_state;
        require!(
            ctx.accounts.authority.key() == bridge.authority,
            BridgeError::Unauthorized
        );
        
        bridge.paused = paused;
        
        msg!("Bridge pause status: {}", paused);
        Ok(())
    }

    /// Withdraw fees (admin only)
    pub fn withdraw_fees(
        ctx: Context<WithdrawFees>,
        amount: u64,
    ) -> Result<()> {
        let bridge = &ctx.accounts.bridge_state;
        require!(
            ctx.accounts.authority.key() == bridge.authority,
            BridgeError::Unauthorized
        );
        
        **ctx.accounts.bridge_state.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? += amount;
        
        msg!("Withdrawn {} lamports", amount);
        Ok(())
    }

    /// Get bridge statistics
    pub fn get_stats(ctx: Context<GetStats>) -> Result<()> {
        let bridge = &ctx.accounts.bridge_state;
        
        msg!("=== Bridge Statistics ===");
        msg!("Authority: {}", bridge.authority);
        msg!("Total USDC Bridged: {}", bridge.total_usdc_bridged);
        msg!("Total AFF Bridged: {}", bridge.total_aff_bridged);
        msg!("Total Messages: {}", bridge.total_messages);
        msg!("Nonce: {}", bridge.nonce);
        msg!("Paused: {}", bridge.paused);
        
        Ok(())
    }
}

// Data structures

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum MessageType {
    BridgeUSDC,
    BridgeAFF,
    BridgeReceipt,
    BridgeVote,
    SettlePosition,
}

#[account]
pub struct BridgeState {
    pub authority: Pubkey,           // 32
    pub polygon_emitter: [u8; 32],   // 32
    pub nonce: u32,                  // 4
    pub total_usdc_bridged: u64,     // 8
    pub total_aff_bridged: u64,      // 8
    pub total_messages: u64,         // 8
    pub paused: bool,                // 1
    // Total: 93 bytes + 8 byte discriminator = 101 bytes
}

// Contexts

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 4 + 8 + 8 + 8 + 1 + 64, // Extra space for future use
        seeds = [b"bridge"],
        bump
    )]
    pub bridge_state: Account<'info, BridgeState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReceiveTokens<'info> {
    #[account(
        mut,
        seeds = [b"bridge"],
        bump,
        has_one = authority
    )]
    pub bridge_state: Account<'info, BridgeState>,
    
    #[account(mut)]
    pub bridge_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SendToPolygon<'info> {
    #[account(mut, seeds = [b"bridge"], bump)]
    pub bridge_state: Account<'info, BridgeState>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub bridge_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SetPause<'info> {
    #[account(mut, seeds = [b"bridge"], bump)]
    pub bridge_state: Account<'info, BridgeState>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawFees<'info> {
    #[account(mut, seeds = [b"bridge"], bump)]
    pub bridge_state: Account<'info, BridgeState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetStats<'info> {
    #[account(seeds = [b"bridge"], bump)]
    pub bridge_state: Account<'info, BridgeState>,
}

// Events

#[event]
pub struct MessageReceived {
    pub message_type: MessageType,
    pub sender: [u8; 32],
    pub amount: u64,
    pub market_id: Option<u64>,
    pub timestamp: i64,
}

#[event]
pub struct MessageSent {
    pub sequence: u32,
    pub message_type: MessageType,
    pub recipient: [u8; 20],
    pub amount: u64,
    pub timestamp: i64,
}

// Errors

#[error_code]
pub enum BridgeError {
    #[msg("Bridge is paused")]
    BridgePaused,
    
    #[msg("Invalid emitter")]
    InvalidEmitter,
    
    #[msg("Invalid message type")]
    InvalidMessageType,
    
    #[msg("Invalid amount")]
    InvalidAmount,
    
    #[msg("Unauthorized")]
    Unauthorized,
}
