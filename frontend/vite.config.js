import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: '/',
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // Vercel Functions run on :3000 via `npx vercel dev`.
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        // Chrome 80+ on Android is the minimum supported browser.
        target: 'es2018',
    },
});
