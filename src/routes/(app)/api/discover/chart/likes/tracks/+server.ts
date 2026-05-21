import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import type { Release, Track } from '$lib/server/prisma/browser';
import z from 'zod';
import type { PartialUser } from '$lib/helpers/utils';

export type GETResponse = (Track & {
    release: Release & {
        user: PartialUser;
    };
    _count: {
        likes: number;
    }
})[];

export async function GET({ url }) {
    const genre = url.searchParams.get('genre');
    const take = z.coerce.number().int().positive().max(100).safeParse(url.searchParams.get('take'));

    const tracks = await prisma.track.findMany({
        where: {
            release: {
                privacy: 'PUBLIC'
            },
            genres: genre
                ? {
                    some: { id: genre }
                }
                : undefined,
            likes: {
                some: {}
            }
        },
        include: {
            release: {
                select: {
                    id: true,
                    name: true,
                    cover: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    }
                }
            },
            _count: {
                select: {
                    likes: true
                }
            }
        },
        orderBy: {
            likes: {
                _count: 'desc'
            }
        },
        take: take.data ?? 100
    });

    return json(
        tracks,
        {
            headers: {
                'Cache-Control': 'public, max-age=300'
            }
        }
    );
}
