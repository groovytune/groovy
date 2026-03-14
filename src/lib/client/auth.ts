import { env } from '$env/dynamic/public';
import { createAuthClient } from 'better-auth/svelte';

export const auth = createAuthClient({
    baseURL: env.PUBLIC_BETTER_AUTH_URL
});
