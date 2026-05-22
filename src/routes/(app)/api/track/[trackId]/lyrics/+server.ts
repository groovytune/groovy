import { prisma } from '$lib/server/prisma';
import { error, json } from '@sveltejs/kit';

export async function GET({ params, locals }) {
    const lyrics = await prisma.lyrics.findUnique({
        where: {
            trackId: params.trackId,
            track: {
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
            }
        },
        cacheStrategy: {
            ttl: 300,
            swr: 60
        }
    });

    if (!lyrics) {
        throw error(404, 'Track not found');
    }

    return json(
        lyrics,
        {
            headers: {
                'Cache-Control': 'public, max-age=300'
            }
        }
    );
}
