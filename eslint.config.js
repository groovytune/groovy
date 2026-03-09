import { includeIgnoreFile } from '@eslint/compat';
import stylistic from '@stylistic/eslint-plugin';
import svelteConfig from './svelte.config.js';
import { defineConfig } from 'eslint/config';
import svelte from 'eslint-plugin-svelte';
import ts from 'typescript-eslint';
import globals from 'globals';
import path from 'node:path';
import js from '@eslint/js';

export default defineConfig(
    includeIgnoreFile(path.resolve(import.meta.dirname, '.gitignore')),
    js.configs.recommended,
    ...ts.configs.recommended,
    ...svelte.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        plugins: {
            '@stylistic': stylistic
        },
        rules: {
            'svelte/no-navigation-without-resolve': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@stylistic/indent': 'error'
        }
    },
    {
        files: [
            '**/*.svelte',
            '**/*.svelte.ts',
            '**/*.svelte.js'
        ],
        languageOptions: {
            parserOptions: {
                projectService: true,
                extraFileExtensions: ['.svelte'],
                parser: ts.parser,
                svelteConfig
            }
        }
    }
);
