import tailwindcss from '@tailwindcss/vite';
import commonjs from '@rollup/plugin-commonjs';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const commonjsPlugin = commonjs({
    dynamicRequireTargets: [
        'node_modules/sharp/**/build/Release/*.node',
        'node_modules/@img/**/sharp.node',
        'node_modules/@img/**/libvips-*'
    ],
    ignoreDynamicRequires: false
});

export default defineConfig({
    plugins: [
        tailwindcss(),
        sveltekit()
    ],
    build: {
        rolldownOptions: {
            external: ['sharp'],
            plugins: [commonjsPlugin]
        },
        rollupOptions: {
            external: ['sharp'],
            plugins: [commonjsPlugin]
        }
    }
});
