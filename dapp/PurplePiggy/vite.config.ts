import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import nodePolyfills from 'rollup-plugin-node-polyfills';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base : '/purple-piggy',
  define: {
    'process.env': {},
    'window.global': {},

  },
  build: {
    rollupOptions: {
      plugins: [
        nodePolyfills({ crypto: true }),
        NodeGlobalsPolyfillPlugin({ buffer: true }),
      ]
    },
  },
})
