import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export async function GET({ params, locals }) {
    const streams = await prisma.stream.count({
        where: {
            track: {
                releaseId: params.releaseId,
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
