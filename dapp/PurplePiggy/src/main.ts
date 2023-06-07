import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { VueClipboard } from '@soerenmartius/vue3-clipboard'

import SolanaWallets from "solana-wallets-vue";

// You can either import the default styles or create your own.
import "solana-wallets-vue/styles.css";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import {
  PhantomWalletAdapter,
  BackpackWalletAdapter,
  SolflareWalletAdapter,
  SlopeWalletAdapter,
} from "@solana/wallet-adapter-wallets";

const walletOptions = {
  wallets: [
    new PhantomWalletAdapter(),
    new BackpackWalletAdapter(),
    new SlopeWalletAdapter(),
    new SolflareWalletAdapter({ network: WalletAdapterNetwork.Devnet }),
  ],
  autoConnect: true,
};

createApp(App).use(SolanaWallets, walletOptions).use(VueClipboard).mount("#app");
