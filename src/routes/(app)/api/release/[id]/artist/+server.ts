import { error, json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { PartialUser } from '$lib/helpers/utils';

export async function GET({ params, locals }) {
    const release = await prisma.release.findUnique({
        where: {
            id: params.id,
            AND: locals.user?.id
                ? {
                    OR: [
                        { privacy: 'PRIVATE', userId: locals.user?.id },
                        { privacy: { not: 'PRIVATE' } }
                    ]
                }
                : { privacy: { not: 'PRIVATE' } }
        },
        select: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true
                }
            }
        }
    }) as Record<'user', PartialUser>|null;

    if (!release) {
        throw error(404, 'Release not found');
    }

    return json(release.user);
}
