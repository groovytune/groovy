import commonjs from '@rollup/plugin-commonjs';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const externalModules = [
    'sharp',
    '@img/sharp-linuxmusl-x64',
    '@img/sharp-wasm32'
];

const nativeBindings = [
    'sharp-linuxmusl-x64',
    'sharp-wasm32'
];

export default defineConfig({
    plugins: [
        tailwindcss(),
        commonjs({
            dynamicRequireTargets: nativeBindings.map(b => `**/node_modules/${b}/**`),
            ignoreDynamicRequires: false
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
