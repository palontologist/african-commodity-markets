use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    clock::Clock,
    sysvar::Sysvar,
};

/// Oracle state account data
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct OracleState {
    pub authority: Pubkey,
    pub is_initialized: bool,
}

/// Price feed account data
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct PriceFeed {
    pub commodity: [u8; 32], // commodity name (padded)
    pub price: u64,          // price in smallest units (e.g., cents)
    pub confidence: u64,     // confidence interval
    pub timestamp: i64,      // unix timestamp
    pub decimals: u8,        // price decimals
}

/// Instruction enum
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum OracleInstruction {
    /// Initialize oracle
    /// Accounts:
    /// 0. `[writable, signer]` Authority account
    /// 1. `[writable]` Oracle state account
    Initialize,

    /// Update price feed
    /// Accounts:
    /// 0. `[signer]` Authority account
    /// 1. `[]` Oracle state account
    /// 2. `[writable]` Price feed account
    UpdatePrice {
        commodity: [u8; 32],
        price: u64,
        confidence: u64,
        decimals: u8,
    },

    /// Get price (read-only, for CPI)
    /// Accounts:
    /// 0. `[]` Price feed account
    GetPrice,
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = OracleInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        OracleInstruction::Initialize => {
            msg!("Instruction: Initialize");
            initialize(program_id, accounts)
        }
        OracleInstruction::UpdatePrice {
            commodity,
            price,
            confidence,
            decimals,
        } => {
            msg!("Instruction: UpdatePrice");
            update_price(program_id, accounts, commodity, price, confidence, decimals)
        }
        OracleInstruction::GetPrice => {
            msg!("Instruction: GetPrice");
            get_price(accounts)
        }
    }
}

fn initialize(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority_info = next_account_info(account_info_iter)?;
    let oracle_state_info = next_account_info(account_info_iter)?;

    // Verify authority is signer
    if !authority_info.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Verify oracle state account is owned by program
    if oracle_state_info.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // Deserialize and check if already initialized
    let mut oracle_state = OracleState::try_from_slice(&oracle_state_info.data.borrow())?;
    if oracle_state.is_initialized {
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    // Initialize state
    oracle_state.authority = *authority_info.key;
    oracle_state.is_initialized = true;

    // Serialize back
    oracle_state.serialize(&mut &mut oracle_state_info.data.borrow_mut()[..])?;

    msg!("Oracle initialized with authority: {}", authority_info.key);
    Ok(())
}

fn update_price(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    commodity: [u8; 32],
    price: u64,
    confidence: u64,
    decimals: u8,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority_info = next_account_info(account_info_iter)?;
    let oracle_state_info = next_account_info(account_info_iter)?;
    let price_feed_info = next_account_info(account_info_iter)?;

    // Verify authority is signer
    if !authority_info.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Verify oracle state
    let oracle_state = OracleState::try_from_slice(&oracle_state_info.data.borrow())?;
    if !oracle_state.is_initialized {
        return Err(ProgramError::UninitializedAccount);
    }
    if oracle_state.authority != *authority_info.key {
        return Err(ProgramError::InvalidAccountData);
    }

    // Verify price feed account is owned by program
    if price_feed_info.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // Get current timestamp
    let clock = Clock::get()?;
    let timestamp = clock.unix_timestamp;

    // Create/update price feed
    let price_feed = PriceFeed {
        commodity,
        price,
        confidence,
        timestamp,
        decimals,
    };

    // Serialize to account
    price_feed.serialize(&mut &mut price_feed_info.data.borrow_mut()[..])?;

    // Convert commodity bytes to string for logging (up to first null)
    let commodity_name = String::from_utf8_lossy(
        &commodity[..commodity.iter().position(|&c| c == 0).unwrap_or(32)]
    );
    msg!("Price updated for {}: {} (confidence: {}, timestamp: {})", 
         commodity_name, price, confidence, timestamp);

    Ok(())
}

fn get_price(accounts: &[AccountInfo]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let price_feed_info = next_account_info(account_info_iter)?;

    // Deserialize price feed
    let price_feed = PriceFeed::try_from_slice(&price_feed_info.data.borrow())?;

    // Return price data (for CPI callers to read)
    msg!("Price: {}, Confidence: {}, Timestamp: {}", 
         price_feed.price, price_feed.confidence, price_feed.timestamp);

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_oracle_state_serialization() {
        let oracle_state = OracleState {
            authority: Pubkey::new_unique(),
            is_initialized: true,
        };

        let mut buffer = vec![0u8; 64];
        oracle_state.serialize(&mut buffer.as_mut_slice()).unwrap();

        let deserialized = OracleState::try_from_slice(&buffer).unwrap();
        assert_eq!(oracle_state.authority, deserialized.authority);
        assert_eq!(oracle_state.is_initialized, deserialized.is_initialized);
    }

    #[test]
    fn test_price_feed_serialization() {
        let mut commodity = [0u8; 32];
        commodity[..5].copy_from_slice(b"MAIZE");

        let price_feed = PriceFeed {
            commodity,
            price: 15000,
            confidence: 100,
            timestamp: 1696896000,
            decimals: 2,
        };

        let mut buffer = vec![0u8; 128];
        price_feed.serialize(&mut buffer.as_mut_slice()).unwrap();

        let deserialized = PriceFeed::try_from_slice(&buffer).unwrap();
        assert_eq!(price_feed.commodity, deserialized.commodity);
        assert_eq!(price_feed.price, deserialized.price);
        assert_eq!(price_feed.confidence, deserialized.confidence);
        assert_eq!(price_feed.timestamp, deserialized.timestamp);
        assert_eq!(price_feed.decimals, deserialized.decimals);
    }
}
