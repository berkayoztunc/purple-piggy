/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";
import { log } from "firebase-functions/logger";
import * as express from "express";
import * as BN from "bn.js";
import * as anchor from "@coral-xyz/anchor";
import * as bodyParser from "body-parser";
import * as web3 from "@solana/web3.js";
import * as idl from "./idl.ts";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// define the max number of instances that can be used to handle a function
setGlobalOptions({ maxInstances: 10 });

const preflightCommitment = "processed";
const commitment = "confirmed";

// create a new express app
const app = express();
const main = express();

// add the path to receive request and set the express app as the handler
main.use("/api/v1", app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

// define get request for the path "/qr-deposite"
app.get("/qr-deposite", async (req, res) => {

  // solana pay required label and icon on GET request
  const label = "Pruple Piggy Bank";
  const icon =
    "https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_28dp.png";
  res.status(200).send({
    label,
    icon,
  });
});

// define post request for the path "/qr-deposite"
app.post("/qr-deposite", async (req, res) => {
  // get the account field from the request body
  const accountField = req.body?.account;
  const PDA: any = req.query.pda;
  const AMOUNT: any = req.query.amount;


  log("New Request via " + accountField + " and " + PDA);

  // create Pubkey from the account field which is the public key of the user
  const sender = new web3.PublicKey(accountField);

  // create Pubkey from the PDA field which is the public key of the program derived address
  const programID = new web3.PublicKey(
    "FZaN7Fs58eKPa6NJ93EeKt1j5x6ZUcCAGsKif7mgeWaZ"
  );

  // create a new connection to the devnet cluster
  const connection = new web3.Connection(
    web3.clusterApiUrl("devnet"),
    commitment
  );

  // create a new anchor provider with the connection, wallet and commitment
  const provider = new anchor.AnchorProvider(
    connection,
    { publicKey: sender } as anchor.Wallet,
    {
      preflightCommitment,
      commitment,
    }
  );

  // create a new program from the idl and programID as similar on test.ts
  const program = new anchor.Program(idl.IDL, programID, provider);

  // create a new instruction from the program
  // solana pay is required to use the program method to create an instruction. if you want to use solana pay you need return the instruction from the program method
  const ix = await program.methods
    .deposite(new BN(AMOUNT))
    .accounts({
      vault: new web3.PublicKey(PDA),
      authority: sender,
      systemProgram: web3.SystemProgram.programId,
    })
    .instruction();

    
  // create a new transaction
  const transaction = new web3.Transaction();
  // get the recent blockhash from the connection . !important SOLANA PAY REQUIRED
  const recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  // set the recent blockhash to the transaction
  transaction.recentBlockhash = recentBlockhash;
  // set the fee payer to the sender. !important SOLANA PAY REQUIRED. at that point you can use your private key to sign the transaction. but it is not recommended.
  transaction.feePayer = sender;
  // add the instruction to the transaction
  transaction.add(ix);

  // serialize the transaction
  const serializedTransaction = transaction.serialize({
    verifySignatures: false,
    requireAllSignatures: false,
  });

  // create a base64 string from the serialized transaction which send to the client
  const base64Transaction = serializedTransaction.toString("base64");

  // set the message for response. its going to visible on the client wallet app 
  const message =
    "Big thanx from biggy owner. You can be sure that it is safely dispersed in the piggy bank.";
  res.status(200).send({ transaction: base64Transaction, message });
});


// create firebase function endpoints

// const name will your endpoint name on firebase
// in my example it will be https://myspacialfunction-qo2dv4mlkq-uc.a.run.app/api/v1/qr-deposite myspacialfunction is the name of the function
export const myspacialFunction = onRequest(main);


// after all you need to deploy your function to the firebase cloud functions
