import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import type { Track } from '$lib/server/prisma/browser';
import z from 'zod';

export type GETResponse = (Track & {
    _count: {
        streams: number;
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
                : undefined
        },
        include: {
            _count: {
                select: {
                    streams: true
                }
            }
        },
        orderBy: {
            streams: {
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
