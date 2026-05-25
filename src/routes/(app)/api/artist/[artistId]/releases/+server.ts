import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import { newReleaseSchema } from '$lib/schema/release.js';
import { orderFilterSchema } from '$lib/schema/filter.js';
import z from 'zod';

export async function GET({ params, url, locals }) {
    const { artistId } = params;

    const take = z.coerce.number().int().positive().max(100).default(20).safeParse(url.searchParams.get('take'));
    const after = z.cuid2().optional().safeParse(url.searchParams.get('after'));
    const order = orderFilterSchema.optional().safeParse(url.searchParams.get('order'));
    const type = newReleaseSchema.shape.type.safeParse(url.searchParams.get('type'));

    const releases = await prisma.release.findMany({
        where: {
            userId: artistId,
            privacy: 'PUBLIC',
            type: type.success
                ? type.data
                : undefined
        },
        take: take.data || 20,
        skip: after.data ? 1 : 0,
        cursor: after.data
            ? { id: after.data }
            : undefined,
        orderBy: {
            id: order.data ?? 'desc'
        },
        cacheStrategy: locals.user?.id !== artistId
            ? {
                ttl: 300,
                swr: 60
            }
            : undefined
    });

    return json(releases);
}
