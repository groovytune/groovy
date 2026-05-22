import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export async function GET({ params }) {
    const streams = await prisma.stream.count({
        where: {
            track: {
                release: {
                    userId: params.artistId
                }
            }
        },
        cacheStrategy: {
            ttl: 3600,
            swr: 300
        }
    });

    return json(
        { count: streams },
        {
            headers: {
                'Cache-Control': 'public, max-age=3600'
            }
        }
    );
}
