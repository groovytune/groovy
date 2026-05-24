import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET({ locals, url }) {
    if (!locals.user) {
        return json([]);
    }

    const userId = url.searchParams.get('userId');
    const tracks = await prisma.track.findMany({
        where: {
            release: {
                user: {
                    id: {
                        not: locals.user.id
                    },
                    OR: [
                        {
                            followers: {
                                some: {
                                    followerId: locals.user.id
                                }
                            }
                        },
                        ...(userId
                            ? [
                                {
                                    followers: {
                                        some: {
                                            followerId: userId
                                        }
                                    }
                                },
                                {
                                    followings: {
                                        some: {
                                            followingId: userId
                                        }
                                    }
                                }
                            ]
                            : []
                        )
                    ]
                }
            },
            streams: {
                none: {
                    userId: locals.user.id
                }
            }
        },
        take: 4,
        cacheStrategy: {
            ttl: 3600,
            swr: 300
        }
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
