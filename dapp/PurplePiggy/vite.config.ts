import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base : '/purple-piggy',
  define: {
    'process.env': {}
  },
  build: {
    rollupOptions: {
      external: [
        'project-serum/anchor'
      ],
    },
  },
})
