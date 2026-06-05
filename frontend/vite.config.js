import { defineConfig } from 'vite';

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
        open: true
    }
});
