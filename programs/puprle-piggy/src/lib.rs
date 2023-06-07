use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("FZaN7Fs58eKPa6NJ93EeKt1j5x6ZUcCAGsKif7mgeWaZ");
#[program]
mod purple_piggy {
    use super::*;
    pub fn initialize(
        ctx: Context<CreateVault>,
        name: String,
        percentages: Vec<u64>,
        acct: Vec<Pubkey>,
    ) -> Result<()> {
        let mut total_rate = 0;
        for item in percentages.iter() {
            total_rate += item;
        }
        
        if total_rate != 100 {
            return Err(ErrorCode::Unauthorized.into());
        }
        if percentages.len() != acct.len() {
            return Err(ErrorCode::Unauthorized.into());
        }
        msg!("Congratulations! You just created a vault.");
        let vault = &mut ctx.accounts.vault;
        vault.authority = *ctx.accounts.authority.to_account_info().key;
        vault.total = 0;
        vault.name = name;
        vault.percentages = percentages;
        vault.accounts = acct;
        for (i, item) in vault.accounts.iter().enumerate() {
            msg!("Participating address {} - and percentage {}%", item, vault.percentages[i]);
        }
        Ok(())
    }

    #[access_control(UpdateVault::accounts(&ctx))]
    pub fn update(
        ctx: Context<UpdateVault>,
        percentages: Vec<u64>,
    ) -> Result<()> {
        let mut total_rate = 0;
        for item in percentages.iter() {
            total_rate += item;
        }
        if total_rate != 100 {
            return Err(ErrorCode::Unauthorized.into());
        }
        if ctx.accounts.vault.accounts.len() != percentages.len() {
            return Err(ErrorCode::Unauthorized.into());
        }
        msg!("Update vault successfully.");
        let vault = &mut ctx.accounts.vault;
        vault.percentages = percentages;
        Ok(())
    }

    #[access_control(UpdateVault::accounts(&ctx))]
    pub fn delete(ctx: Context<UpdateVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.close(ctx.accounts.authority.to_account_info())?;
        msg!("Vault deleted successfully.");
        Ok(())
    }

    // deposite money to piggy
    pub fn deposite(ctx: Context<Deposite>, lamports: u64) -> Result<()> {
        let  vault  = &mut ctx.accounts.vault;

        vault.total += lamports;

        let mut vec:Vec<u64> = vec![0; vault.accounts.len()];
        let mut vec2:Vec<u64> = vec![0; vault.accounts.len()];
        for (i , vaulter) in vault.accounts_vault.iter().enumerate() {
            vec2[i] = *vaulter;
        }
        for (i , percentages) in vault.percentages.iter().enumerate() {
            let money = percentages * lamports as u64 / 100;
            vec[i] = vec2[i] + money;
            msg!("Money for {} : {} ", i, vec[i])
        }
        vault.accounts_vault = vec;
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.authority.to_account_info().clone(),
                to: vault.to_account_info().clone(),
            },
        );
        system_program::transfer(cpi_context, lamports)?;
        msg!("Deposite successfully. total: {}", vault.total);
        Ok(())
    }

    // claim money from piggy to vault accounts
    #[access_control(ClaimVault::accounts(&ctx))]
    pub fn claim(ctx: Context<ClaimVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let vaultbalance = vault.total;

        if vaultbalance == 0 {
            return Err(ErrorCode::Unauthorized.into());
        }
        for (i, address) in vault.accounts.iter().enumerate() {
            if address == ctx.accounts.claimer.to_account_info().key {
                let money = vault.accounts_vault[i];
                if money == 0 {
                    return Err(ErrorCode::Unauthorized.into());
                } else {
                    **vault.to_account_info().try_borrow_mut_lamports()? -= money;
                    **ctx.accounts.claimer.try_borrow_mut_lamports()? += money;
                    vault.total = vault.total - money;
                    vault.accounts_vault[i] = 0;
                    msg!("Claim successfully. total: {}", vault.total);
                }
                return Ok(());
            }
        }
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String,percentage: Vec<u64>)]
pub struct CreateVault<'info> {
    #[account(init,
        payer=authority,
        space = 8 + CreateVault::space(&name,percentage),
        seeds=[
            b"vault",
            name_seed(&name),
            authority.to_account_info().key.as_ref(),
        ],
        bump)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateVault<'info> {
    #[account(mut, has_one=authority @ ErrorCode::WrongOwner)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct Deposite<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimVault<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub claimer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Vault {
    pub name : String,
    pub authority: Pubkey,
    pub total: u64,
    pub percentages: Vec<u64>,   
    pub accounts_vault: Vec<u64>,
    pub accounts: Vec<Pubkey>,    
}

impl CreateVault<'_> {
    fn space(name: &str, acct: Vec<u64>) -> usize {
        let name_len = name.len() as usize;
        let accounts_len = acct.len();
        let name_size = 4 + name_len;
        let authority_size = 32;  // Assuming the authority field is always a Pubkey (32 bytes)
        let total_size = 8;
        let percentages_size = 4 + (8 * (1 + accounts_len));
        let accounts_vault_size = 4 + (8 * (1 + accounts_len));
        let accounts_size = 4 + (32 * (1 + accounts_len));
        name_size + authority_size + total_size + percentages_size + accounts_vault_size + accounts_size
    }
}
// Error handling
#[error_code]
pub enum ErrorCode {
    #[msg("Sum of percentages must be 100")]
    SumPercentages,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Wrong Owner")]
    WrongOwner,
}


impl UpdateVault<'_> {
    pub fn accounts(ctx: &Context<UpdateVault>) -> Result<()> {
        if ctx.accounts.authority.key != &ctx.accounts.vault.authority {
            return Err(ErrorCode::Unauthorized.into());
        }
        Ok(())
    }
}
impl ClaimVault<'_> {
    pub fn accounts(ctx: &Context<ClaimVault>) -> Result<()> {
        let vault = &ctx.accounts.vault;
        // check authory key in vault accounts
        if !vault.accounts.contains(&ctx.accounts.claimer.key) {
            return Err(ErrorCode::Unauthorized.into());
        }
        Ok(())
    }
}
fn name_seed(name: &str) -> &[u8] {
    let b = name.as_bytes();
    if b.len() > 32 {
        &b[0..32]
    } else {
        b
    }
}