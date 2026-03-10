// See https://svelte.dev/docs/kit/types#app.d.ts
import type { MetaTagsProps } from 'svelte-meta-tags';

// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        interface PageData {
            pageMetaTags?: MetaTagsProps;
        }
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
