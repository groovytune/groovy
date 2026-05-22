import { error, json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { Track } from '$lib/server/prisma/client.js';

export type GETResponse = Track[];

export async function GET({ params, locals }) {
    const tracks = await prisma.track.findMany({
        where: {
            release: {
                id: params.releaseId,
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
        cacheStrategy: {
            ttl: 60
        }
    });

    if (!tracks) {
        throw error(404, 'Tracks not found');
    }

    return json(
        tracks,
        {
            headers: {
                'Cache-Control': 'public, max-age=60'
            }
        }
    );
}
