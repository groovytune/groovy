import { prisma } from '$lib/server/prisma.js';
import type { Release } from '$lib/server/prisma/client.js';
import type { PartialUser } from '$lib/helpers/utils.js';

export type ReleaseWithUser = Release & { user: PartialUser; };

export async function load({ locals }): Promise<{ releases: ReleaseWithUser[] }> {
    const releases = await prisma.release.findMany({
        where: {
            OR: locals.user
                ? [
                    { userId: locals.user.id },
                    { privacy: 'PUBLIC' }
                ]
                : [
                    { privacy: 'PUBLIC' }
                ]
        },
        orderBy: {
            createdAt: 'desc'
        },
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
    }) as ReleaseWithUser[];

    return { releases };
}
