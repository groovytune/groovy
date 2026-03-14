import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from '$app/environment';
import type { Session } from 'better-auth';
import type { User } from 'better-auth';

export async function handle({ event, resolve }) {
    const session = await auth.api.getSession({
        headers: event.request.headers
    }) as {
        session: Session;
        user: User;
    };

    event.locals.session = session;
    event.locals.user = session?.user ?? null;

    return svelteKitHandler({ event, resolve, auth, building });
}
