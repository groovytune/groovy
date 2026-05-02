import { prisma } from '$lib/server/prisma.js';
import type { Release } from '$lib/server/prisma/client.js';

export async function load({ locals }): Promise<{ releases: Release[] }> {
    if (!locals.user) {
        return { releases: [] };
    }

    const releases = await prisma.release.findMany({
        where: {
            userId: locals.user.id
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return { releases };
}
