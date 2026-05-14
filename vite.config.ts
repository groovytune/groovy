import tailwindcss from '@tailwindcss/vite';
import commonjs from '@rollup/plugin-commonjs';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        tailwindcss(),
        // configure commonjs plugin so Rollup can resolve sharp's dynamic native requires
        commonjs({
            dynamicRequireTargets: [
                'node_modules/sharp/**/build/Release/*.node',
                'node_modules/@img/**/sharp.node',
                'node_modules/@img/**/libvips-*'
            ],
            ignoreDynamicRequires: false
        }),
        sveltekit()
    ],
    ssr: {
        external: ['sharp']
    },
    build: {
        rolldownOptions: {
            external: ['sharp']
        },
        rollupOptions: {
            external: ['sharp']
        }
    }
});
