import { ComputedRef, computed } from "vue";
import { useAnchorWallet } from "solana-wallets-vue";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@project-serum/anchor";

import { IDL } from "./idl.js";
import { Buffer } from 'buffer';

const preflightCommitment = "processed";
const commitment = "confirmed";

let workspace: {
    formatThePubkey: (pubkey: PublicKey) => string;
    handlePDA: (name:string,wallet:Wallet) => Promise<PublicKey>;
    wallet: any;
    connection: Connection;
    provider: ComputedRef<any>;
    program: ComputedRef<any>;
} | null = null;
export const useWorkspace = () => workspace;

export const initWorkspace = () => {
    const programID = new PublicKey(
        "FZaN7Fs58eKPa6NJ93EeKt1j5x6ZUcCAGsKif7mgeWaZ"
    );
    const wallet = useAnchorWallet();
    const connection = new Connection(clusterApiUrl("devnet"), commitment);
    const provider = computed(
        () =>
            new AnchorProvider(connection, wallet.value, {
                preflightCommitment,
                commitment,
            })
    );
    const program = computed(() => new Program(IDL, programID, provider.value));
    const handlePDA = async (name:string,wallet:Wallet) => {
        const [vault, bump] =
            await PublicKey.findProgramAddressSync(
                [
                    Buffer.from("vault"),
                    Buffer.from(name),
                    wallet.publicKey.toBytes(),
                ],
                programID
            );
        return vault;
    };
    const formatThePubkey = (pubkey:PublicKey) => {
        const pubkeyStr = pubkey.toString();
        const pubkeyStrLength = pubkeyStr.length;
        const pubkeyStrFirst = pubkeyStr.slice(0, 5);
        const pubkeyStrLast = pubkeyStr.slice(pubkeyStrLength - 5, pubkeyStrLength);
        return `${pubkeyStrFirst}...${pubkeyStrLast}`;
    };

    workspace = {
        formatThePubkey,
        handlePDA,
        wallet,
        connection,
        provider,
        program,
    };
};


