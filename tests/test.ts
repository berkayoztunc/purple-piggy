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
   * h
   * System accounts constant for test
   */
  const pair = JSON.parse(process.env.PRIVATE_KEY);
  const pair_person_1 = JSON.parse(process.env.PERSON_1_KEY);
  const pair_person_2 = JSON.parse(process.env.PERSON_2_KEY);
  const vaultOwner = anchor.web3.Keypair.fromSecretKey(Buffer.from(pair));
  const person1 = anchor.web3.Keypair.fromSecretKey(Buffer.from(pair_person_1));
  const person2 = anchor.web3.Keypair.fromSecretKey(Buffer.from(pair_person_2));
  const PDAwillDeleteAfterTest = true;
  const sendSomeLamportToPersons = false;
  const personAirdropLamports = LAMPORTS_PER_SOL / 100;
  const poolDepositeLamports = LAMPORTS_PER_SOL / 100;
  const program = anchor.workspace.PurplePiggy as Program<PurplePiggy>;
  const programProvider = program.provider as anchor.AnchorProvider;
  const programID = anchor.workspace.PurplePiggy.programId;
  const seedForPDA = "vault";
  const vaultName = "Awesome Vault";

  async function handlePDA() {
    const [vault, bump] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(seedForPDA),Buffer.from(vaultName), vaultOwner.publicKey.toBytes()],
      programID
    );
    return vault;
  }
  async function getBalanceOfAddress(address: anchor.web3.PublicKey) {
    const balance = await program.provider.connection.getBalance(address);
    return balance;
  }

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
  it("Can claim person 1", async () => {
    const pda = await handlePDA();
    const startBalance = await getBalanceOfAddress(person1.publicKey);
    await personClaim(person1, pda);
    const vaultAccount = await program.account.vault.fetch(pda);
    const endBalance = await getBalanceOfAddress(person1.publicKey);
    assert(endBalance > startBalance);
    assert(vaultAccount.accountsVault[0].eq(new anchor.BN(0)));
  });
  it("Can claim person 2", async () => {
    const pda = await handlePDA();
    const startBalance = await getBalanceOfAddress(person2.publicKey);

    await personClaim(person2, pda);
    const vaultAccount = await program.account.vault.fetch(pda);
    const endBalance = await getBalanceOfAddress(person2.publicKey);
    assert(endBalance > startBalance);
    assert(vaultAccount.accountsVault[1].eq(new anchor.BN(0)));
  });
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
    assert(vaultAccount.accountsVault[0].eq(amount.mul(new anchor.BN(25)).div(new anchor.BN(100))));
    assert(vaultAccount.accountsVault[1].eq(amount.mul(new anchor.BN(75)).div(new anchor.BN(100))));
    
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
