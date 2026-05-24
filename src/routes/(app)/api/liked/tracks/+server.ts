import { error, json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import { orderFilterSchema } from '$lib/schema/filter.js';
import z from 'zod';

export async function GET({ url, locals }) {
    if (!locals.user) {
        throw error(401, "Unauthorized");
    }

    const take = z.coerce.number().int().positive().max(100).default(20).safeParse(url.searchParams.get('take'));
    const after = z.cuid2().optional().safeParse(url.searchParams.get('after'));
    const order = orderFilterSchema.optional().safeParse(url.searchParams.get('order'));

    const releases = await prisma.track.findMany({
        where: {
            likes: {
                some: {
                    userId: locals.user?.id
                }
            },
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
                select: {
                    id: true,
                    name: true,
                    cover: true
                }
            }
        },
        take: take.data || 20,
        skip: after.data ? 1 : 0,
        cursor: after.data
            ? { id: after.data }
            : undefined,
        orderBy: {
            id: order.data ?? 'desc'
        }
    });

    return json(releases);
}
