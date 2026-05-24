import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { PartialUser } from '$lib/helpers/utils.js';

export type GETResponse = (PartialUser & {
    _count: {
        followers: number;
        following: number;
    };
})[];

export async function GET({ locals, url }) {
    if (!locals.user) {
        return json([]);
    }

    const userId = url.searchParams.get('userId');
    const artists = await prisma.user.findMany({
        where: {
            id: {
                not: locals.user.id
            },
            followers: {
                none: {
                    followerId: locals.user.id
                },
                some: {
                    follower: {
                        following: userId
                            ? {
                                some: {
                                    userId
                                }
                            }
                            : undefined,
                        followers: {
                            some: {
                                followerId: locals.user.id
                            }
                        }
                    }
                }
            }
        },
        select: {
            id: true,
            name: true,
            username: true,
            image: true,
            _count: {
                select: {
                    followers: true,
                    following: true
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
        artists,
        {
            headers: {
                'Cache-Control': 'public, max-age=3600'
            }
        }
    );
}
