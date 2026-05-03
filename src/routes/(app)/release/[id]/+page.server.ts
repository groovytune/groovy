import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { Release, Track, User } from '$lib/server/prisma/client.js';

export type ReleasePageData = Release & {
    user: Pick<User, 'id'|'name'|'username'|'image'>;
    tracks: Track[];
};

export async function load({ params, locals }) {
    const { id } = params;

    const release = await prisma.release.findUnique({
        where: {
            id,
            AND: locals.user
                ? {
                    OR: [
                        { userId: locals.user.id },
                        { privacy: { not: 'PRIVATE' } }
                    ]
                }
                : { privacy: { not: 'PRIVATE' } }
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true
                },
            },
            tracks: true
        }
    }) as ReleasePageData | null;

    if (!release) {
        throw error(404, 'Release not found');
    }

    return { release };
}
