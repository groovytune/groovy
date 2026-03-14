// See https://svelte.dev/docs/kit/types#app.d.ts
import type { MetaTagsProps } from 'svelte-meta-tags';

// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            session: {
                session: Session;
                user: User;
            }|null;
            user: User|null;
        }
        interface PageData {
            pageMetaTags?: MetaTagsProps;
        }
        // interface PageState {}
        // interface Platform {}
    }
}

declare module "better-auth" {
    export type JustUser = z.infer<typeof userSchema>


    export interface User extends JustUser {
        role: 'user'|'admin';
        username?: string;
    }
}

export {};
