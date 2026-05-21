import { prisma } from '$lib/server/prisma.js';
import { json } from '@sveltejs/kit';
import { DateTime } from 'luxon';
import z from 'zod';
import type { Release } from '$lib/server/prisma/browser.js';
import type { PartialUser } from '$lib/helpers/utils.js';

export type GETResponse = (Release & {
    _count: {
        tracks: number;
    };
    user: PartialUser;
})[];

export async function GET({ url }) {
    const genre = url.searchParams.get('genre');
    const take = z.coerce.number().int().positive().max(100).safeParse(url.searchParams.get('take'));
    const days = z.coerce.number().int().positive().max(365).safeParse(url.searchParams.get('days'));

    const date = DateTime.now().minus({ days: days.data || 30 });

    const releases = await prisma.release.findMany({
        where: {
            privacy: 'PUBLIC',
            genres: genre
                ? {
                    some: { id: genre }
                }
                : undefined,
            createdAt: {
                gte: date.toJSDate()
            }
        },
        include: {
            _count: {
                select: {
                    tracks: true
                }
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: take.data || 40,
    });

    return json(
        releases,
        {
            headers: {
                'Cache-Control': `public, max-age=3600`
            }
        }
    );
}
