<script setup module="ts">
import { useWorkspace, initWorkspace } from "../lib/useWorkspace";

import { reactive, ref, onMounted } from "vue";

const piggys = ref([]);

const { program ,formatThePubkey} = useWorkspace();
onMounted(async () => {
    initWorkspace();
    let data = await program.value.account.vault.all();
    piggys.value = data;
});

async function refresh() {
    let data = await program.value.account.vault.all();
    piggys.value = data;
}

</script>
<template>
    <div class="card-body">
        <h2 class="card-title">
            All Piggy
            <a @click="refresh">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon icon-tabler icon-tabler-rotate-clockwise"
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
                    <path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5" />
                </svg>
            </a>
        </h2>
        <div class="overflow-x-auto">
            <table class="table">
                <!-- head -->
                <thead>
                    <tr>
                        <th>PDA</th>
                        <th>Authority</th>
                        <th>Name</th>
                        <th>Vault</th>
                        <th>Sharer</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- row 1 -->
                    <tr v-for="item in piggys">
                        <th>
                            <button v-clipboard="item.publicKey.toString()">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="icon icon-tabler icon-tabler-copy"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="#ffffff"
                                    fill="none"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path
                                        stroke="none"
                                        d="M0 0h24v24H0z"
                                        fill="none"
                                    />
                                    <path
                                        d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"
                                    />
                                    <path
                                        d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"
                                    />
                                </svg>
                            </button>
                            <span> {{ formatThePubkey(item.publicKey.toString()) }}</span>
                        </th>
                        <th>{{ formatThePubkey(item.account.authority) }}</th>
                        <td>{{ item.account.name }}</td>
                        <td>{{ item.account.total.toNumber() / 1000000000 }}</td>
                        <td>{{ item.account.percentages.length }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
