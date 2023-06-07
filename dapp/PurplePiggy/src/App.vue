<script setup lang="ts">
import { WalletMultiButton } from "solana-wallets-vue";

import { initWorkspace } from "./lib/useWorkspace";

import CreatePiggy from "./components/CreatePiggy.vue";
import ListAllPiggy from "./components/ListAllPiggy.vue";
import ClaimFromPiggy from "./components/ClaimFromPiggy.vue";
initWorkspace();
</script>

<template>
    <div class="navbar bg-base-100">
        <div class="navbar-start item-center">
        </div>
        <div class="navbar-center">
            <img src="./assets/pplogo.png" class="h-16" alt="" />
        </div>
        <div class="navbar-end">
            <wallet-multi-button></wallet-multi-button>
        </div>
    </div>
    <div class="container-md mx-auto px-4">
        <div class="grid grid-cols-4 gap-4">
            <div class="col-span-4 md:col-span-2 card  shadow-xl">
                <CreatePiggy />
            </div>
            <div class="col-span-4 md:col-span-2 card  shadow-xl">
                <ClaimFromPiggy />
            </div>
            <div class="col-span-4  card  shadow-xl">
                <ListAllPiggy />
            </div>
        </div>
    </div>
</template>
