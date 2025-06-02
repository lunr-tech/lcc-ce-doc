import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 5173, // 👈 Set your desired port here
        host: '0.0.0.0', // optional: allows access from external devices
        open: false, // optional: opens browser automatically
    },
})
