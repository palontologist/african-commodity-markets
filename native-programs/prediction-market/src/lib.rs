use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke,
    program_error::ProgramError,
    program_pack::Pack,
    pubkey::Pubkey,
    clock::Clock,
    sysvar::Sysvar,
};
use spl_token::state::Account as TokenAccount;

/// Market state
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct PredictionMarket {
    pub commodity: [u8; 32],     // commodity name
    pub target_price: u64,       // target price to predict
    pub expiry: i64,             // expiry timestamp
    pub resolved: bool,          // is market resolved
    pub outcome: bool,           // true if price >= target, false otherwise
    pub yes_pool: u64,           // total USDC in YES pool
    pub no_pool: u64,            // total USDC in NO pool
    pub oracle_program: Pubkey,  // oracle program for price feed
    pub price_feed: Pubkey,      // price feed account
    pub vault: Pubkey,           // USDC vault account
    pub decimals: u8,            // price decimals
}

/// User position
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct UserPosition {
    pub market: Pubkey,
    pub user: Pubkey,
    pub yes_shares: u64,
    pub no_shares: u64,
    pub claimed: bool,
}

/// Instructions
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum MarketInstruction {
    /// Create a new prediction market
    /// Accounts:
    /// 0. `[writable, signer]` Creator account
    /// 1. `[writable]` Market account
    /// 2. `[]` Oracle program
    /// 3. `[]` Price feed account
    /// 4. `[]` USDC vault account
    CreateMarket {
        commodity: [u8; 32],
        target_price: u64,
        expiry: i64,
        decimals: u8,
    },

    /// Buy shares (YES or NO)
    /// Accounts:
    /// 0. `[signer]` User account
    /// 1. `[writable]` Market account
    /// 2. `[writable]` User position account
    /// 3. `[writable]` User USDC token account
    /// 4. `[writable]` Market USDC vault
    /// 5. `[]` SPL Token program
    BuyShares {
        amount: u64,
        is_yes: bool,
    },

    /// Resolve market using oracle
    /// Accounts:
    /// 0. `[signer]` Authority account
    /// 1. `[writable]` Market account
    /// 2. `[]` Oracle program
    /// 3. `[]` Price feed account
    /// 4. `[]` Clock sysvar
    ResolveMarket,

    /// Claim winnings
    /// Accounts:
    /// 0. `[signer]` User account
    /// 1. `[]` Market account
    /// 2. `[writable]` User position account
    /// 3. `[writable]` User USDC token account
    /// 4. `[writable]` Market USDC vault
    /// 5. `[]` Vault authority PDA
    /// 6. `[]` SPL Token program
    ClaimWinnings,
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = MarketInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        MarketInstruction::CreateMarket {
            commodity,
            target_price,
            expiry,
            decimals,
        } => {
            msg!("Instruction: CreateMarket");
            create_market(program_id, accounts, commodity, target_price, expiry, decimals)
        }
        MarketInstruction::BuyShares { amount, is_yes } => {
            msg!("Instruction: BuyShares");
            buy_shares(program_id, accounts, amount, is_yes)
        }
        MarketInstruction::ResolveMarket => {
            msg!("Instruction: ResolveMarket");
            resolve_market(program_id, accounts)
        }
        MarketInstruction::ClaimWinnings => {
            msg!("Instruction: ClaimWinnings");
            claim_winnings(program_id, accounts)
        }
    }
}

fn create_market(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    commodity: [u8; 32],
    target_price: u64,
    expiry: i64,
    decimals: u8,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let creator_info = next_account_info(account_info_iter)?;
    let market_info = next_account_info(account_info_iter)?;
    let oracle_program_info = next_account_info(account_info_iter)?;
    let price_feed_info = next_account_info(account_info_iter)?;
    let vault_info = next_account_info(account_info_iter)?;

    // Verify creator is signer
    if !creator_info.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Verify market account is owned by program
    if market_info.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // Create market state
    let market = PredictionMarket {
        commodity,
        target_price,
        expiry,
        resolved: false,
        outcome: false,
        yes_pool: 0,
        no_pool: 0,
        oracle_program: *oracle_program_info.key,
        price_feed: *price_feed_info.key,
        vault: *vault_info.key,
        decimals,
    };

    // Serialize to account
    market.serialize(&mut &mut market_info.data.borrow_mut()[..])?;

    let commodity_name = String::from_utf8_lossy(
        &commodity[..commodity.iter().position(|&c| c == 0).unwrap_or(32)]
    );
    msg!("Market created for {}: target={}, expiry={}", 
         commodity_name, target_price, expiry);

    Ok(())
}

fn buy_shares(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
    is_yes: bool,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let user_info = next_account_info(account_info_iter)?;
    let market_info = next_account_info(account_info_iter)?;
    let position_info = next_account_info(account_info_iter)?;
    let user_token_info = next_account_info(account_info_iter)?;
    let vault_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;

    // Verify user is signer
    if !user_info.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Load market
    let mut market = PredictionMarket::try_from_slice(&market_info.data.borrow())?;
    
    // Check market not expired
    let clock = Clock::get()?;
    if clock.unix_timestamp >= market.expiry {
        return Err(ProgramError::InvalidArgument);
    }

    // Check market not resolved
    if market.resolved {
        return Err(ProgramError::InvalidArgument);
    }

    // Transfer USDC from user to vault
    let transfer_instruction = spl_token::instruction::transfer(
        token_program_info.key,
        user_token_info.key,
        vault_info.key,
        user_info.key,
        &[],
        amount,
    )?;

    invoke(
        &transfer_instruction,
        &[
            user_token_info.clone(),
            vault_info.clone(),
            user_info.clone(),
            token_program_info.clone(),
        ],
    )?;

    // Calculate shares using AMM formula: shares = amount * (other_pool + k) / (same_pool + k)
    // For simplicity, using 1:1 for now (can be enhanced with proper AMM math)
    let shares = amount;

    // Update pools
    if is_yes {
        market.yes_pool += amount;
    } else {
        market.no_pool += amount;
    }

    // Update market
    market.serialize(&mut &mut market_info.data.borrow_mut()[..])?;

    // Load or create user position
    let mut position = if position_info.data_len() > 0 && position_info.try_borrow_data()?[0] != 0 {
        UserPosition::try_from_slice(&position_info.data.borrow())?
    } else {
        UserPosition {
            market: *market_info.key,
            user: *user_info.key,
            yes_shares: 0,
            no_shares: 0,
            claimed: false,
        }
    };

    // Update shares
    if is_yes {
        position.yes_shares += shares;
    } else {
        position.no_shares += shares;
    }

    // Save position
    position.serialize(&mut &mut position_info.data.borrow_mut()[..])?;

    msg!("User bought {} {} shares for {} USDC", 
         shares, if is_yes { "YES" } else { "NO" }, amount);

    Ok(())
}

fn resolve_market(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let _authority_info = next_account_info(account_info_iter)?;
    let market_info = next_account_info(account_info_iter)?;
    let _oracle_program_info = next_account_info(account_info_iter)?;
    let price_feed_info = next_account_info(account_info_iter)?;

    // Load market
    let mut market = PredictionMarket::try_from_slice(&market_info.data.borrow())?;

    // Check not already resolved
    if market.resolved {
        return Err(ProgramError::InvalidArgument);
    }

    // Check market expired
    let clock = Clock::get()?;
    if clock.unix_timestamp < market.expiry {
        return Err(ProgramError::InvalidArgument);
    }

    // Read price from oracle (simplified - assumes borsh serialization)
    // In production, would do proper CPI call
    let price_data = price_feed_info.try_borrow_data()?;
    if price_data.len() < 40 {
        return Err(ProgramError::InvalidAccountData);
    }

    // Skip commodity (32 bytes), read price (8 bytes)
    let price_bytes: [u8; 8] = price_data[32..40].try_into().unwrap();
    let actual_price = u64::from_le_bytes(price_bytes);

    // Determine outcome
    market.outcome = actual_price >= market.target_price;
    market.resolved = true;

    // Save market
    market.serialize(&mut &mut market_info.data.borrow_mut()[..])?;

    msg!("Market resolved: actual_price={}, target={}, outcome={}", 
         actual_price, market.target_price, market.outcome);

    Ok(())
}

fn claim_winnings(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let user_info = next_account_info(account_info_iter)?;
    let market_info = next_account_info(account_info_iter)?;
    let position_info = next_account_info(account_info_iter)?;
    let user_token_info = next_account_info(account_info_iter)?;
    let vault_info = next_account_info(account_info_iter)?;
    let vault_authority_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;

    // Verify user is signer
    if !user_info.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Load market
    let market = PredictionMarket::try_from_slice(&market_info.data.borrow())?;

    // Check market is resolved
    if !market.resolved {
        return Err(ProgramError::InvalidArgument);
    }

    // Load position
    let mut position = UserPosition::try_from_slice(&position_info.data.borrow())?;

    // Check not already claimed
    if position.claimed {
        return Err(ProgramError::InvalidArgument);
    }

    // Check user matches
    if position.user != *user_info.key {
        return Err(ProgramError::InvalidArgument);
    }

    // Calculate winnings
    let winning_shares = if market.outcome {
        position.yes_shares
    } else {
        position.no_shares
    };

    if winning_shares == 0 {
        return Err(ProgramError::InvalidArgument);
    }

    // Calculate payout: (winning_shares / winning_pool) * total_pool
    let total_pool = market.yes_pool + market.no_pool;
    let winning_pool = if market.outcome { market.yes_pool } else { market.no_pool };
    
    let payout = if winning_pool > 0 {
        (winning_shares as u128 * total_pool as u128 / winning_pool as u128) as u64
    } else {
        0
    };

    if payout == 0 {
        return Err(ProgramError::InsufficientFunds);
    }

    // Transfer winnings from vault to user
    let transfer_instruction = spl_token::instruction::transfer(
        token_program_info.key,
        vault_info.key,
        user_token_info.key,
        vault_authority_info.key,
        &[],
        payout,
    )?;

    invoke(
        &transfer_instruction,
        &[
            vault_info.clone(),
            user_token_info.clone(),
            vault_authority_info.clone(),
            token_program_info.clone(),
        ],
    )?;

    // Mark as claimed
    position.claimed = true;
    position.serialize(&mut &mut position_info.data.borrow_mut()[..])?;

    msg!("User claimed {} USDC in winnings", payout);

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_market_serialization() {
        let mut commodity = [0u8; 32];
        commodity[..5].copy_from_slice(b"MAIZE");

        let market = PredictionMarket {
            commodity,
            target_price: 15000,
            expiry: 1696896000,
            resolved: false,
            outcome: false,
            yes_pool: 1000,
            no_pool: 1000,
            oracle_program: Pubkey::new_unique(),
            price_feed: Pubkey::new_unique(),
            vault: Pubkey::new_unique(),
            decimals: 2,
        };

        let mut buffer = vec![0u8; 256];
        market.serialize(&mut buffer.as_mut_slice()).unwrap();

        let deserialized = PredictionMarket::try_from_slice(&buffer).unwrap();
        assert_eq!(market.target_price, deserialized.target_price);
        assert_eq!(market.yes_pool, deserialized.yes_pool);
    }
}
