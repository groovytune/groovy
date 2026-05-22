import { prisma } from '$lib/server/prisma.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { userResolvable } = params;

    const user = await prisma.user.findUnique({
        where: userResolvable.startsWith('@')
            ? { username: userResolvable.slice(1) }
            : { id: userResolvable },
        select: {
            id: true,
            name: true,
            username: true,
            image: true,
        },
        cacheStrategy: {
            ttl: 300,
            swr: 60
        }
    });

    if (!user) {
        throw error(404, 'Artist not found');
    }

    return { user };
}
