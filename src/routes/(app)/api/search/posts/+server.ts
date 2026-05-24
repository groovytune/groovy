import z from 'zod';
import { prisma } from '$lib/server/prisma.js';
import { error, json } from '@sveltejs/kit';
import { tsQueryParser } from '$lib/helpers/constants';
import { orderFilterSchema } from '$lib/schema/filter';

export async function GET({ url }) {
    const query = z.string().min(1).trim().transform(val => tsQueryParser.parseAndStringify(val)).safeParse(url.searchParams.get("q"));
    const order = orderFilterSchema.optional().safeParse(url.searchParams.get("order"));
    const after = url.searchParams.get("after");
    const take = z.coerce.number().int().positive().max(50).default(20).safeParse(url.searchParams.get("take"));

    if (!query.success) {
        throw error(400, "Invalid query parameter");
    }

    const results = await prisma.post.findMany({
        where: {
            OR: [
                {
                    content: {
                        search: query.data
                    }
                },
                {
                    user: {
                        OR: [
                            {
                                name: {
                                    search: query.data
                                }
                            },
                            {
                                username: {
                                    search: query.data
                                }
                            }
                        ]
                    }
                },
                {
                    reference: {
                        content: {
                            search: query.data
                        }
                    }
                }
            ]
        },
        orderBy: {
            _relevance: {
                fields: ["content"],
                search: query.data,
                sort: order.data ?? "desc"
            }
        },
        cursor: after ? { id: after } : undefined,
        skip: after ? 1 : undefined,
        take: take.data ?? 20,
        cacheStrategy: {
            ttl: 3600,
            swr: 300
        }
    });

    return json(
        results,
        {
            headers: {
                "Cache-Control": "public, max-age=3600, stale-while-revalidate=300"
            }
        }
    )
}
