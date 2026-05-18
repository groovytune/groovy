import { redirect } from '@sveltejs/kit';
import { createAuthRedirect } from '$lib/helpers/utils';
import { prisma } from '$lib/server/prisma';
import { resolve } from '$app/paths';

export async function load({ params, locals, url }) {
    if (!locals.session) {
        throw redirect(302, createAuthRedirect('signin', url));
    }

    const lyrics = await prisma.lyrics.findUnique({
        where: {
            trackId: params.trackId,
            track: {
                id: params.trackId,
                release: {
                    id: params.releaseId,
                    userId: locals.session.user.id
                }
            }
        }
    });

    if (!lyrics) {
        throw redirect(302, resolve('/(app)/release/[releaseId]/edit/tracks', { releaseId: params.releaseId }));
    }

    return {
        lyrics
    };
}
