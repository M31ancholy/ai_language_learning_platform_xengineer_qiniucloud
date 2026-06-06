import { defineConfig } from 'vite';

const backendTarget = process.env.VITE_BACKEND_URL || 'http://localhost:8081';

export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            output: {
                // Remove manualChunks to prevent rolldown build error
            }
        }
    },
    server: {
        port: 8080,
        open: true,
        proxy: {
            '/api': {
                target: backendTarget,
                changeOrigin: true,
                ws: true // Enable WebSocket proxy support
            },
            '/ws': {
                target: backendTarget,
                ws: true,
                changeOrigin: true
            }
        }
    }
});
