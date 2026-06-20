import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import { definePageMetaTags } from 'svelte-meta-tags';

export async function load({ locals }) {
    if (locals.user) {
        redirect(302, resolve('/(app)/home'));
    }

    const title = `Groovy`;
    const description = `Discover and share music freely on Groovy, the ultimate platform for artists and listeners. Build your profile, publish your music, and connect with a vibrant community of music lovers. Join us today and let your music move souls!`;

    return {
        ...definePageMetaTags({
            title,
            description,
            openGraph: {
                title,
                description,
            }
        })
    };
}
