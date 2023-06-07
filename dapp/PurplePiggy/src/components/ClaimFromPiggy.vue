<script setup module="ts">
import { useWorkspace, initWorkspace } from "../lib/useWorkspace";
import * as anchor from "@coral-xyz/anchor";
import { encodeURL, createQR } from "@solana/pay";

import { reactive, ref, onMounted } from "vue";
import { SystemProgram } from "@solana/web3.js";

const piggy = ref(null);
const PDA = ref();
const depositeAmount = ref(0);
const qr = ref(null);

const { program, wallet,formatThePubkey } = useWorkspace();

onMounted(async () => {
    initWorkspace();
});
async function deletePiggy() {
    await program.value.methods
        .delete()
        .accounts({
            vault: new anchor.web3.PublicKey(PDA.value),
            authority: wallet.value.publicKey,
            systemProgram: SystemProgram.programId,
        })
        .rpc();
}

async function deposite() {
    await program.value.methods
        .deposite(new anchor.BN(depositeAmount.value * 1000000000))
        .accounts({
            vault: new anchor.web3.PublicKey(PDA.value),
            authority: wallet.value.publicKey,
            systemProgram: SystemProgram.programId,
        })
        .rpc();
}
async function claim() {
    await program.value.methods
        .claim()
        .accounts({
            vault: new anchor.web3.PublicKey(PDA.value),
            authority: wallet.value.publicKey,
            systemProgram: SystemProgram.programId,
        })
        .rpc();
}

async function createQRCode() {
    my_modal_2.showModal();
    let url = encodeURL({
        label: "Pruple Piggy Bank",
        link:
            "https://myspacialfunction-qo2dv4mlkq-uc.a.run.app/api/v1/qr-deposite?pda=" +
            PDA.value +
            "&amount=" +
            depositeAmount.value * 1000000000,
    });
    const qrCode = createQR(url);
    qrCode.append(qr.value);
}
async function downloadQrCode() {
    let url = encodeURL({
        label: "Pruple Piggy Bank",
        link:
            "https://myspacialfunction-qo2dv4mlkq-uc.a.run.app/api/v1/qr-deposite?pda=" +
            PDA.value +
            "&amount=" +
            depositeAmount.value * 1000000000,
    });
    const qrCode = createQR(url);
    qrCode.download();
}

async function getPiggy() {
    piggy.value = await program.value.account.vault.fetch(PDA.value);
}
</script>
<template>
    <div class="card-body">
        <h2 class="card-title">Piggy Actions</h2>
        <div class="form-control">
            <div class="input-group">
                <input
                    type="text"
                    v-model="PDA"
                    placeholder="Your Piggy PDA"
                    class="input input-bordered w-3/4"
                />
                <a class="btn btn-square w-1/4" @click="getPiggy">
                    Get it
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="icon icon-tabler icon-tabler-cloud-search"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="#ffffff"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path
                            d="M11 18.004h-4.343c-2.572 -.004 -4.657 -2.011 -4.657 -4.487c0 -2.475 2.085 -4.482 4.657 -4.482c.393 -1.762 1.794 -3.2 3.675 -3.773c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99"
                        />
                        <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                        <path d="M20.2 20.2l1.8 1.8" /></svg
                ></a>
            </div>
        </div>
        <div v-if="piggy != null">
            <div>{{ piggy.name }}</div>
            <div class="overflow-x-auto">

            <table class="table">
                <thead>
                    <tr>
                        <th>Wallet</th>
                        <th>balance</th>
                        <th>Share</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in piggy.accounts">
                        <td>{{ formatThePubkey(item) }}</td>
                        <td>{{ piggy.accountsVault[index] / 1000000000}} </td>
                        <td>{{ piggy.percentages[index] }} %</td>
                        <td>
                            <a
                                v-if="wallet.publicKey == item.toString()"
                                class="btn btn-info btn-xs"
                                @click="claim"
                                >Claim
                               
                           </a>
                            <span v-else>-</span>
                        </td>
                    </tr>
                </tbody>
            </table>
            </div>
            <p>
                You can close piggy and get all found inside that all accounts.
                <a
                    @click="deletePiggy"
                    class="text-red-400 cursor-pointer"
                    v-if="piggy.authority.toString() == wallet.publicKey"
                    >Delete</a
                >
                piggy
            </p>
        </div>
        <dialog id="my_modal_2" class="modal">
            <form
                method="dialog"
                class="modal-box w-6/12 max-w-5xl flex flex-col"
            >
                <h3 class="font-bold text-lg text-center">
                    Deposite {{ depositeAmount }} SOL
                </h3>
                <p class="py-4 text-center">
                    Press ESC key or click outside to close
                </p>
                <div id="qr" ref="qr" class="mx-auto"></div>
                <a @click="downloadQrCode" class="text-center">Download</a>
            </form>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
        <div class="form-control">
            <div class="input-group">
                <input
                    type="text"
                    v-model="depositeAmount"
                    placeholder="Deposite Amount (SOL)"
                    class="input input-bordered w-2/4"
                />
                <a class="btn btn-square w-1/4" @click="deposite"
                    >Deposite
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="icon icon-tabler icon-tabler-currency-solana"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="#ffffff"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M4 18h12l4 -4h-12z" />
                        <path d="M8 14l-4 -4h12l4 4" />
                        <path d="M16 10l4 -4h-12l-4 4" /></svg
                ></a>
                <a class="btn btn-square w-1/4" @click="createQRCode"
                    ><svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="icon icon-tabler icon-tabler-qrcode"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="#ffffff"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path
                            d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"
                        />
                        <path d="M7 17l0 .01" />
                        <path
                            d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"
                        />
                        <path d="M7 7l0 .01" />
                        <path
                            d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"
                        />
                        <path d="M17 7l0 .01" />
                        <path d="M14 14l3 0" />
                        <path d="M20 14l0 .01" />
                        <path d="M14 14l0 3" />
                        <path d="M14 20l3 0" />
                        <path d="M17 17l3 0" />
                        <path d="M20 17l0 3" />
                    </svg>
                    QR</a
                >
            </div>
        </div>
    </div>
</template>
