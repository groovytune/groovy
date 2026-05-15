import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import commonjs from 'vite-plugin-commonjs';
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
        commonjs({
            filter: id => externalModules.some(module => id.includes(module))
        }),
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
