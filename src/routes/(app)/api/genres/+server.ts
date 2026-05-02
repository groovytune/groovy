import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET({ url }) {
    const after = url.searchParams.get('after');
    const before = url.searchParams.get('before');
    const search = url.searchParams.get('search');

    const afterTimestamp = after && !isNaN(parseInt(after)) ? parseInt(after) : null;
    const beforeTimestamp = before && !isNaN(parseInt(before)) ? parseInt(before) : null;

    const genres = await prisma.genre.findMany({
        where: {
            createdAt: {
                gt: afterTimestamp ? new Date(afterTimestamp) : undefined,
                lt: beforeTimestamp ? new Date(beforeTimestamp) : undefined
            },
            name: search ? {
                contains: search,
                mode: 'insensitive'
            } : undefined
        },
        select: {
            id: true,
            name: true
        },
        take: 20,
    });

    return json(genres);
}
