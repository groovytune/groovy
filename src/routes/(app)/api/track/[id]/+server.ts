import { prisma } from '$lib/server/prisma';
import { error, json } from '@sveltejs/kit';
import type { Release, Track } from '$lib/server/prisma/client.js';
import type { PartialUser } from '$lib/helpers/utils.js';

export type GETResponse = Track & {
    release: Release & {
        user: PartialUser;
    }
};

export async function GET({ params, locals }) {
    const track = await prisma.track.findUnique({
        where: {
            id: params.id,
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
        include: {
            release: {
                include: {
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
    });

    if (!track) {
        throw error(404, 'Track not found');
    }

    return json(track);
}
