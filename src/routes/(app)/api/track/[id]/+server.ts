import { prisma } from '$lib/server/prisma';
import { error, json } from '@sveltejs/kit';
import type { Release, Track, User } from '$lib/server/prisma/client.js';

export type GETResponse = Track & {
    release: Release & {
        user: Pick<User, 'id'|'name'|'username'|'image'>;
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
        throw error(404, 'Release not found');
    }

    return json(track);
}
