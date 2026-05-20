import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET({ url }) {
    const genre = url.searchParams.get('genre');

    const tracks = await prisma.track.findMany({
        where: {
            release: {
                privacy: 'PUBLIC'
            },
            genres: genre ? {
                some: { id: genre }
            } : undefined
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
        take: 100
    });

    return json(tracks);
}
