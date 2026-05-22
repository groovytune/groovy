import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { PartialUser } from '$lib/helpers/utils.js';

export type GETResponse = (PartialUser & {
    _count: {
        followers: number;
        following: number;
    };
})[];

export async function GET({ locals }) {
    if (!locals.user) {
        return json([]);
    }

    const artists = await prisma.user.findMany({
        where: {
            id: {
                not: locals.user.id
            },
            followers: {
                none: {
                    id: locals.user.id
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
        take: 4
    });

    return json(artists);
}
