import { redirect } from '@sveltejs/kit';
import { createAuthRedirect } from '$lib/helpers/utils';
import { prisma } from '$lib/server/prisma';
import { resolve } from '$app/paths';

export async function load({ params, locals, url }) {
    if (!locals.session) {
        throw redirect(302, createAuthRedirect('signin', url));
    }

    const track = await prisma.track.findUnique({
        where: {
            id: params.trackId,
            release: {
                id: params.releaseId,
                userId: locals.session.user.id
            }
        },
        include: {
            lyrics: true,
            release: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    if (!track) {
        throw redirect(302, resolve('/(app)/release/[releaseId]/edit/tracks', { releaseId: params.releaseId }));
    }

    return {
        track
    };
}
