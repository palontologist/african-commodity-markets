use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use wormhole_anchor_sdk::wormhole;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

/// Solana side of Afrifutures Wormhole Bridge
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
        Ok(())
    }

    /// Receive USDC from Polygon and auto-stake
    pub fn receive_and_stake(
        ctx: Context<ReceiveAndStake>,
        vaa_hash: [u8; 32],
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge_state;
        require!(!bridge.paused, BridgeError::BridgePaused);
        
        // Verify VAA is from Polygon bridge
        let vaa = &ctx.accounts.vaa;
        require!(
            vaa.emitter_address() == bridge.polygon_emitter,
            BridgeError::InvalidEmitter
        );
        
        // Check if already processed
        require!(
            !bridge.processed_vaas.contains(&vaa_hash),
            BridgeError::VAAAlreadyProcessed
        );
        
        // Decode payload
        let payload = vaa.payload();
        let message = BridgeMessage::try_from_slice(payload)?;
        
        match message.message_type {
            MessageType::BridgeUSDC => {
                // Transfer USDC from bridge to user
                let amount = message.amount;
                
                token::transfer(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.bridge_usdc_account.to_account_info(),
                            to: ctx.accounts.user_usdc_account.to_account_info(),
                            authority: bridge.to_account_info(),
                        },
                    ),
                    amount,
                )?;
                
                // If auto-stake is enabled, stake in specified market
                if let Some(market_id) = message.market_id {
                    // TODO: Call prediction market stake instruction
                    msg!("Auto-staking {} USDC in market {}", amount, market_id);
                }
                
                bridge.total_usdc_bridged += amount;
            }
            MessageType::BridgeAFF => {
                // Mint wrapped $AFF tokens
                let amount = message.amount;
                
                token::transfer(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.bridge_aff_account.to_account_info(),
                            to: ctx.accounts.user_aff_account.to_account_info(),
                            authority: bridge.to_account_info(),
                        },
                    ),
                    amount,
                )?;
                
                bridge.total_aff_bridged += amount;
            }
            MessageType::BridgeVote => {
                // Record vote for governance
                msg!("Recording vote for proposal {}", message.proposal_id.unwrap_or(0));
                // TODO: Integrate with governance program
            }
            _ => return Err(BridgeError::InvalidMessageType.into()),
        }
        
        // Mark VAA as processed
        bridge.processed_vaas.push(vaa_hash);
        bridge.total_messages += 1;
        bridge.nonce += 1;
        
        emit!(MessageReceived {
            vaa_hash,
            message_type: message.message_type,
            sender: message.sender,
            amount: message.amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
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
                    from: ctx.accounts.user_usdc_account.to_account_info(),
                    to: ctx.accounts.bridge_usdc_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;
        
        // Encode message for Wormhole
        let message = BridgeMessage {
            message_type: MessageType::SettlePosition,
            sender: ctx.accounts.user.key().to_bytes(),
            recipient: polygon_recipient,
            amount,
            market_id: None,
            proposal_id: None,
            is_yes: None,
            timestamp: Clock::get()?.unix_timestamp,
        };
        
        let payload = message.try_to_vec()?;
        
        // Send via Wormhole
        wormhole::post_message(
            CpiContext::new_with_signer(
                ctx.accounts.wormhole_program.to_account_info(),
                wormhole::PostMessage {
                    config: ctx.accounts.wormhole_config.to_account_info(),
                    message: ctx.accounts.wormhole_message.to_account_info(),
                    emitter: ctx.accounts.wormhole_emitter.to_account_info(),
                    sequence: ctx.accounts.wormhole_sequence.to_account_info(),
                    payer: ctx.accounts.user.to_account_info(),
                    fee_collector: ctx.accounts.wormhole_fee_collector.to_account_info(),
                    clock: ctx.accounts.clock.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                },
                &[],
            ),
            bridge.nonce,
            payload,
            wormhole::ConsistencyLevel::Finalized,
        )?;
        
        bridge.nonce += 1;
        
        emit!(MessageSent {
            sequence: bridge.nonce - 1,
            message_type: MessageType::SettlePosition,
            recipient: polygon_recipient,
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct BridgeMessage {
    pub message_type: MessageType,
    pub sender: [u8; 32],
    pub recipient: [u8; 20], // Ethereum address
    pub amount: u64,
    pub market_id: Option<u64>,
    pub proposal_id: Option<u64>,
    pub is_yes: Option<bool>,
    pub timestamp: i64,
}

#[account]
pub struct BridgeState {
    pub authority: Pubkey,
    pub polygon_emitter: [u8; 32],
    pub nonce: u32,
    pub total_usdc_bridged: u64,
    pub total_aff_bridged: u64,
    pub total_messages: u64,
    pub processed_vaas: Vec<[u8; 32]>,
    pub paused: bool,
}

// Contexts

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 4 + 8 + 8 + 8 + (4 + 32 * 1000) + 1,
        seeds = [b"bridge"],
        bump
    )]
    pub bridge_state: Account<'info, BridgeState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReceiveAndStake<'info> {
    #[account(mut, seeds = [b"bridge"], bump)]
    pub bridge_state: Account<'info, BridgeState>,
    
    /// Wormhole VAA (Verified Action Approval)
    pub vaa: Account<'info, wormhole::PostedVaa>,
    
    #[account(mut)]
    pub bridge_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub bridge_aff_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_aff_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SendToPolygon<'info> {
    #[account(mut, seeds = [b"bridge"], bump)]
    pub bridge_state: Account<'info, BridgeState>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub bridge_usdc_account: Account<'info, TokenAccount>,
    
    /// Wormhole accounts
    pub wormhole_program: Program<'info, wormhole::program::Wormhole>,
    
    #[account(mut)]
    pub wormhole_config: Account<'info, wormhole::Config>,
    
    #[account(mut)]
    pub wormhole_message: Signer<'info>,
    
    #[account(mut)]
    pub wormhole_emitter: Account<'info, wormhole::EmitterAccount>,
    
    #[account(mut)]
    pub wormhole_sequence: Account<'info, wormhole::SequenceAccount>,
    
    #[account(mut)]
    pub wormhole_fee_collector: Account<'info, wormhole::FeeCollector>,
    
    pub clock: Sysvar<'info, Clock>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
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

// Events

#[event]
pub struct MessageReceived {
    pub vaa_hash: [u8; 32],
    pub message_type: MessageType,
    pub sender: [u8; 32],
    pub amount: u64,
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
    
    #[msg("VAA already processed")]
    VAAAlreadyProcessed,
    
    #[msg("Invalid message type")]
    InvalidMessageType,
    
    #[msg("Invalid amount")]
    InvalidAmount,
    
    #[msg("Unauthorized")]
    Unauthorized,
}
