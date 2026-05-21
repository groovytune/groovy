import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export async function GET({ params, locals }) {
    const likes = await prisma.releaseLike.count({
        where: {
            releaseId: params.releaseId,
            release: {
                id: params.releaseId,
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
    });

    return json({ count: likes });
}
