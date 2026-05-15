import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const externalModules = [
    'sharp',
    '@img/sharp-linuxmusl-x64',
    '@img/sharp-wasm32',
    'sharp-linuxmusl-x64',
    'sharp-wasm32'
];

export default defineConfig({
    plugins: [
        tailwindcss(),
        sveltekit()
    ],
    optimizeDeps: {
        exclude: externalModules
    },
    build: {
        rolldownOptions: {
            external: externalModules,
        },
        rollupOptions: {
            external: externalModules,
        }
    }
});
