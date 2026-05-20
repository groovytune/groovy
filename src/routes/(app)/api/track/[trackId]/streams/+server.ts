import z from 'zod';
import { prisma } from '$lib/server/prisma';
import { json } from '@sveltejs/kit';

export async function GET({ params, locals, url }) {
    const before = url.searchParams.get('before');
    const after = url.searchParams.get('after');

    const streams = await prisma.stream.count({
        where: {
            trackId: params.trackId,
            track: {
                id: params.trackId,
                release: {
                    AND: locals.user?.id
                        ? {
                            OR: [
                                { privacy: 'PRIVATE', userId: locals.user?.id },
                                { privacy: { not: 'PRIVATE' } }
                            ]
                        }
                        : { privacy: { not: 'PRIVATE' } }
                }
            },
            createdAt: {
                ...(before ? { lt: z.coerce.date().safeParse(before).data } : {}),
                ...(after ? { gt: z.coerce.date().safeParse(after).data } : {})
            }
        }
    });

    return json(
        { count: streams },
        {
            headers: {
                'Cache-Control': 'public, max-age=300'
            }
        }
    );
}
