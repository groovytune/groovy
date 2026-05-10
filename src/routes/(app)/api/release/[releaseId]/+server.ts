import { error, json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export async function GET({ params, locals }) {
    const release = await prisma.release.findUnique({
        where: {
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
    });

    if (!release) {
        throw error(404, 'Release not found');
    }

    return json(release);
}
