import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import z from 'zod';
import { orderFilterSchema } from '$lib/schema/filter.js';
import { tsQueryParser } from '$lib/helpers/constants';

export async function GET({ url }) {
    const search = z.string().transform(val => tsQueryParser.parseAndStringify(val)).safeParse(url.searchParams.get('search'));
    const take = z.coerce.number().int().positive().max(100).optional().safeParse(url.searchParams.get('take'));
    const order = orderFilterSchema.optional().safeParse(url.searchParams.get('order'));
    const after = z.cuid2().optional().safeParse(url.searchParams.get('after'));

    const genres = await prisma.genre.findMany({
        where: {
            name: search.data
                ? {
                    search: search.data
                }
                : undefined
        },
        select: {
            id: true,
            name: true
        },
        take: take.data || 20,
        skip: after.data ? 1 : undefined,
        cursor: after.data ? { id: after.data } : undefined,
        orderBy: search.data
            ? {
                _relevance: {
                    fields: ["name"],
                    search: search.data,
                    sort: order.data ?? 'asc',
                }
            }
            : { name: order.data ?? 'asc' }
    });

    return json(genres);
}
