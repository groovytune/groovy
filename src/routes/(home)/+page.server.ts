import { prisma } from '$lib/server/prisma.js';
import type { Release, User } from '$lib/server/prisma/client.js';

export type ReleaseWithUser = (Release & { user: Pick<User, 'id'|'name'|'username'|'image'>; });

export async function load({ locals }): Promise<{ releases: ReleaseWithUser[] }> {
    if (!locals.user) {
        return { releases: [] };
    }

    const releases = await prisma.release.findMany({
        where: {
            OR: [
                { userId: locals.user.id },
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
