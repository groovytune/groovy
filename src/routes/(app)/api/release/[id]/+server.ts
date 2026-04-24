import { error, json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { Track } from '$lib/server/prisma/client.js';
import type { User } from 'better-auth';

export type GETResponse = Track & {
    user: Pick<User, 'id'|'name'|'username'|'image'>;
    tracks: Pick<Track, 'id'|'name'|'explicit'|'position'>[];
}

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
        include: {
            tracks: {
                select: {
                    id: true,
                    name: true,
                    explicit: true,
                    position: true,
                }
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true
                }
            }
        }
    });

    if (!release) {
        throw error(404, 'Release not found');
    }

    return json(release);
}
