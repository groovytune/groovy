import { prisma } from '$lib/server/prisma';
import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { countStream } from '$lib/helpers/stream';

export async function GET({ params, locals, request, url }) {
    const track = await prisma.track.findUnique({
        where: {
            id: params.id,
            release: {
                AND: locals.user?.id
                    ? {
                        OR: [
                            { privacy: 'PRIVATE', userId: locals.user?.id },
                            { privacy: { not: 'PRIVATE' } }
                        ]
                    }
                    : { privacy: { not: 'PRIVATE' } }
            }
        },
        select: {
            id: true,
            file: true
        }
    });

    if (!track) {
        throw error(404, 'Track not found');
    }

    countStream({
        trackId: track.id,
        hostname: request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
        userId: locals.user?.id
    }).catch(err => console.error(`Error counting stream for ${track.id}:`, err));

    redirect(307, resolve('/(app)/api/assets/audio/[fileId]', { fileId: track.file }) + url.search);
}
