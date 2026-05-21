import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export async function GET({ params, locals }) {
    const likes = await prisma.trackLike.count({
        where: {
            trackId: params.trackId,
            track: {
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

    return json({ count: likes });
}
