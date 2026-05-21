import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import z from 'zod';

export async function GET({ url }) {
    const take = z.coerce.number().int().positive().max(100).safeParse(url.searchParams.get('take'));
    const artists = await prisma.user.findMany({
        where: {
            followers: {
                some: {}
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
        orderBy: {
            followers: {
                _count: 'desc'
            }
        },
        take: take.data ?? 20
    });

    return json(
        artists,
        {
            headers: {
                'Cache-Control': 'public, max-age=300'
            }
        }
    );
}
