

[logo]: https://github.com/berkayoztunc/purple-piggy/raw/master/tutorials/icon.png "Logo Title Text 2"

# Purple Piggy
Purple Piggy is a Solana program that allows users to create and manage vaults. A vault is a collection of funds that can be shared by multiple users.

## Instructions
To create a vault, users must specify a name, a list of percentages, and a list of accounts. The percentages must add up to 100, and the accounts must be Solana public keys.

Once a vault has been created, users can deposit funds into it. The funds will be divided among the accounts according to their percentages.

Users can also withdraw funds from a vault. The amount of funds that can be withdrawn is limited by the user's percentage ownership of the vault.

## Functions

```initialize```: This function is used to initialize a new vault. It takes in the context ctx, the vault name as a string, a vector of percentages (representing the distribution percentages for each account), and a vector of acct (representing the participating account addresses). It checks if the total percentage is equal to 100 and if the lengths of percentages and acct match. If the checks pass, it initializes the vault with the provided parameters and logs the participating addresses and their percentages.

```update```: This function is used to update the vault settings. It takes in the context ctx, the updated percentages vector, and the updated acct vector. It performs the same checks as the initialize function and updates the vault with the new settings.

```delete```: This function is used to delete the vault. It takes in the context ctx and closes the vault by transferring ownership to the program's authority. It logs a message indicating the successful deletion of the vault.

```deposite```: This function is used to deposit money into the vault. It takes in the context ctx and the lamports (amount of money) to be deposited. It calculates the distribution of the deposited amount based on the percentages defined in the vault. It transfers the lamports from the caller to the vault and updates the vault's total balance. It logs a message indicating the successful deposit.

```claim```: This function is used to claim money from the vault to the caller's account. It takes in the context ctx. It checks if the caller's account is one of the participating accounts in the vault. If so, it transfers the corresponding amount from the vault to the caller's account and updates the vault's total balance. It logs a message indicating the successful claim.

| Function    | Input Parameters                          | Accounts                                | Output Parameters              | Error Handling                |
|-------------|-------------------------------------------|-----------------------------------------|--------------------------------|-------------------------------|
| initialize  | ctx: Context<CreateVault>                  | vault: Account<'info, Vault>             | Result<(), ErrorCode>         | ErrorCode::Unauthorized      |
|             | name: String                              | authority: Signer<'info>                 |                                | ErrorCode::SumPercentages    |
|             | percentages: Vec<u64>                     | system_program: Program<'info, System>   |                                |                               |
|             | acct: Vec<Pubkey>                         |                                         |                                |                               |
| update      | ctx: Context<UpdateVault>                  | vault: Account<'info, Vault>             | Result<(), ErrorCode>         | ErrorCode::Unauthorized      |
|             | percentages: Vec<u64>                     | authority: Signer<'info>                 |                                | ErrorCode::SumPercentages    |
|             | acct: Vec<Pubkey>                         | system_program: Program<'info, System>   |                                |                               |
| delete      | ctx: Context<UpdateVault>                  | vault: Account<'info, Vault>             | Result<(), ErrorCode>         |                               |
| deposite    | ctx: Context<Deposite>                     | vault: Account<'info, Vault>             | Result<(), ErrorCode>         |                               |
|             | lamports: u64                              | authority: Signer<'info>                 |                                |                               |
| claim       | ctx: Context<ClaimVault>                   | vault: Account<'info, Vault>             | Result<(), ErrorCode>         | ErrorCode::Unauthorized      |
|                                                        | claimer: Signer<'info>                   |                                |                               |
|                                                        | system_program: Program<'info, System>   |                                |                               |


## Error Handling
The Purple Piggy program can return the following errors:

- SumPercentages: The percentages do not add up to 100.
- Unauthorized: The user does not have permission to perform the requested operation.
- WrongOwner: The user is not the owner of the vault.



## Future Features
The Purple Piggy program is still under development. Future features include:

- The ability to create multiple vaults.
- The ability to transfer funds between vaults.
- The ability to add and remove accounts from vaults.
## Contact
If you have any questions about the Purple Piggy program, please contact the developer at