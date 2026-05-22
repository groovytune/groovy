import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET({ locals }) {
    if (!locals.user) {
        return json([]);
    }

    const tracks = await prisma.track.findMany({
        where: {
            release: {
                user: {
                    id: {
                        not: locals.user.id
                    },
                    followers: {
                        some: {
                            followerId: locals.user.id
                        }
                    }
                }
            },
            streams: {
                none: {
                    userId: locals.user.id
                }
            }
        },
        take: 4,
    });

    return json(
        tracks,
        {
            headers: {
                'Cache-Control': 'public, max-age=3600'
            }
        }
    );
}
