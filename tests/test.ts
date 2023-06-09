import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PurplePiggy } from "../target/types/purple_piggy";
import { assert } from "chai";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { configDotenv } from "dotenv";

configDotenv();

describe("purple-piggy", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  /**
   * System accounts constant for test
   */

  // Parse the private keys for the vault owner and persons from environment variables

  const pair = JSON.parse(process.env.VAULT_OWNER_KEY);
  const pair_person_1 = JSON.parse(process.env.PERSON_1_KEY);
  const pair_person_2 = JSON.parse(process.env.PERSON_2_KEY);
  // Create keypairs for the vault owner and persons

  const vaultOwner = anchor.web3.Keypair.fromSecretKey(Buffer.from(pair));
  const person1 = anchor.web3.Keypair.fromSecretKey(Buffer.from(pair_person_1));
  const person2 = anchor.web3.Keypair.fromSecretKey(Buffer.from(pair_person_2));
  // Configuration flags and constants

  const PDAwillDeleteAfterTest = true;
  const sendSomeLamportToPersons = true;
  const personAirdropLamports = LAMPORTS_PER_SOL / 100;
  const poolDepositeLamports = LAMPORTS_PER_SOL / 100;
  // Configuration flags and constants

  const program = anchor.workspace.PurplePiggy as Program<PurplePiggy>;
  const programProvider = program.provider as anchor.AnchorProvider;
  const programID = anchor.workspace.PurplePiggy.programId;
  // Constants for PDA and vault name

  const seedForPDA = "vault";
  const vaultName = "Awesome Vault";

  // Function to calculate and return the Program Derived Address (PDA) for the vault
  async function handlePDA() {
    const [vault, bump] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from(seedForPDA),
        Buffer.from(vaultName),
        vaultOwner.publicKey.toBytes(),
      ],
      programID
    );
    return vault;
  }
  // Function to get the balance of a Solana address
  async function getBalanceOfAddress(address: anchor.web3.PublicKey) {
    const balance = await program.provider.connection.getBalance(address);
    return balance;
  }

  // Function to simulate a person claiming funds from the vault
  async function personClaim(person: anchor.web3.Keypair, pda) {
    await program.methods
      .claim()
      .accounts({
        vault: pda,
        claimer: person.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([person])
      .rpc();
  }

  // If sendSomeLamportToPersons flag is set, transfer lamports from vaultOwner to person1 and person2
  if (sendSomeLamportToPersons) {
    it("Ready to perseon sol", async () => {
      var transaction = new anchor.web3.Transaction().add(
        anchor.web3.SystemProgram.transfer({
          fromPubkey: vaultOwner.publicKey,
          toPubkey: person1.publicKey,
          lamports: personAirdropLamports,
        }),
        anchor.web3.SystemProgram.transfer({
          fromPubkey: vaultOwner.publicKey,
          toPubkey: person2.publicKey,
          lamports: personAirdropLamports,
        })
      );
      var signature = await anchor.web3.sendAndConfirmTransaction(
        programProvider.connection,
        transaction,
        [vaultOwner]
      );
    });
  }
  // Test case: Check if the vault is initialized correctly
  it("Is initialized!", async () => {
    const pda = await handlePDA();
    const percentages: anchor.BN[] = [50, 50].map(
      (percentage) => new anchor.BN(percentage)
    );
    await program.methods
      .initialize(vaultName, percentages, [
        person1.publicKey,
        person2.publicKey,
      ])
      .accounts({
        vault: pda,
        authority: vaultOwner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([vaultOwner])
      .rpc();

    const vaultAccount = await program.account.vault.fetch(pda);
    assert(vaultAccount.authority.equals(vaultOwner.publicKey));
    assert(vaultAccount.total.eq(new anchor.BN(0)));
    assert(vaultAccount.percentages[0].eq(new anchor.BN(50)));
    assert(vaultAccount.percentages[1].eq(new anchor.BN(50)));
    assert(vaultAccount.accounts[0].equals(person1.publicKey));
    assert(vaultAccount.accounts[1].equals(person2.publicKey));
  });

  // Test case: Deposit sol into the vault
  it("Deposite sol in vault", async () => {
    const pda = await handlePDA();
    const amount = new anchor.BN(poolDepositeLamports);
    await program.methods
      .deposite(amount)
      .accounts({
        vault: pda,
        authority: vaultOwner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([vaultOwner])
      .rpc();
    const vaultAccount = await program.account.vault.fetch(pda);
    assert(vaultAccount.total.eq(amount));
    assert(vaultAccount.accountsVault[0].eq(amount.div(new anchor.BN(2))));
    assert(vaultAccount.accountsVault[1].eq(amount.div(new anchor.BN(2))));
  });
  // Test case: Person 1 claims funds from the vault
  it("Person 1 claims", async () => {
    const pda = await handlePDA();
    const startBalance = await getBalanceOfAddress(person1.publicKey);
    await personClaim(person1, pda);
    const vaultAccount = await program.account.vault.fetch(pda);
    const endBalance = await getBalanceOfAddress(person1.publicKey);
    assert(endBalance > startBalance);
    assert(vaultAccount.accountsVault[0].eq(new anchor.BN(0)));
  });
  // Test case: Person 2 claims funds from the vault

  it("Person 2 claims", async () => {
    const pda = await handlePDA();
    const startBalance = await getBalanceOfAddress(person2.publicKey);

    await personClaim(person2, pda);
    const vaultAccount = await program.account.vault.fetch(pda);
    const endBalance = await getBalanceOfAddress(person2.publicKey);
    assert(endBalance > startBalance);
    assert(vaultAccount.accountsVault[1].eq(new anchor.BN(0)));
  });
  // Test case: A random person cannot claim funds from the vault
  it("Random person cant claim", async () => {
    const pda = await handlePDA();
    const randomPerson = anchor.web3.Keypair.generate();
    try {
      await program.methods
        .claim()
        .accounts({
          vault: pda,
          claimer: randomPerson.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([randomPerson])
        .rpc();
      assert.fail("Unauthorized");
    } catch (error) {
      assert.ok(error.message.includes("Unauthorized"));
    }
  });
  // Test case: Update the vault's percentages
  it("Update vault", async () => {
    const pda = await handlePDA();
    const percentages: anchor.BN[] = [25, 75].map(
      (percentage) => new anchor.BN(percentage)
    );
    await program.methods
      .update(percentages)
      .accounts({
        vault: pda,
        authority: vaultOwner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([vaultOwner])
      .rpc();
    const vaultAccount = await program.account.vault.fetch(pda);
    assert(vaultAccount.percentages[0].eq(new anchor.BN(25)));
    assert(vaultAccount.percentages[1].eq(new anchor.BN(75)));
  });
  it("after update Deposite again", async () => {
    const pda = await handlePDA();
    const amount = new anchor.BN(poolDepositeLamports);
    await program.methods
      .deposite(amount)
      .accounts({
        vault: pda,
        authority: vaultOwner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([vaultOwner])
      .rpc();
    const vaultAccount = await program.account.vault.fetch(pda);
    assert(vaultAccount.total.eq(amount));
    assert(
      vaultAccount.accountsVault[0].eq(
        amount.mul(new anchor.BN(25)).div(new anchor.BN(100))
      )
    );
    assert(
      vaultAccount.accountsVault[1].eq(
        amount.mul(new anchor.BN(75)).div(new anchor.BN(100))
      )
    );
  });
  it("after update Can claim person 1", async () => {
    const pda = await handlePDA();
    const startBalance = await getBalanceOfAddress(person1.publicKey);
    await personClaim(person1, pda);
    const vaultAccount = await program.account.vault.fetch(pda);
    const endBalance = await getBalanceOfAddress(person1.publicKey);
    assert(endBalance > startBalance);
    assert(vaultAccount.accountsVault[0].eq(new anchor.BN(0)));
  });
  it("after update Can claim person 2", async () => {
    const pda = await handlePDA();
    const startBalance = await getBalanceOfAddress(person2.publicKey);

    await personClaim(person2, pda);
    const vaultAccount = await program.account.vault.fetch(pda);
    const endBalance = await getBalanceOfAddress(person2.publicKey);
    assert(endBalance > startBalance);
    assert(vaultAccount.accountsVault[1].eq(new anchor.BN(0)));
  });
  if (PDAwillDeleteAfterTest) {
    // Clean up: Delete the vault account if flag is set
    it("delete vault", async () => {
      const pda = await handlePDA();

      await program.methods
        .delete()
        .accounts({
          vault: pda,
          authority: vaultOwner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // assert vault account is deleted
      try {
        // Try to fetch the vault account, expecting an error
        await program.account.vault.fetch(pda);
        // If the fetch succeeds, the vault account was not deleted
        assert.fail("Vault account still exists");
      } catch (error) {
        // Expecting an error, indicating the vault account was deleted
        assert.ok(error.message.includes("does not exist or has"));
      }
    });
  }
});
