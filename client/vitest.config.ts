/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './tests/setup.ts',
        css: false,
    },
    resolve: {
        alias: {
            "@": path.resolve("./src"),
            "@shared": path.resolve("../shared"),
            "zod": path.resolve("./node_modules/zod"),
        },
    },
})
