import { prisma } from '$lib/server/prisma';
import { error, json } from '@sveltejs/kit';
import type { PartialUser } from '$lib/helpers/utils.js';

export async function GET({ params, locals }) {
    const track = await prisma.track.findUnique({
        where: {
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
        select: {
            release: {
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
            }
        }
    }) as Record<'release', Record<'user', PartialUser>>|null;

    if (!track) {
        throw error(404, 'Release not found');
    }

    return json(track.release.user);
}
