import { error, json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import { orderFilterSchema } from '$lib/schema/filter.js';
import z from 'zod';
import type { Track, TrackLike } from '$lib/server/prisma/browser';

export type GETResponse = (TrackLike & {
    track: Track & {
        release: {
            id: string;
            name: string;
            cover: string | null;
        };
    }
})[];

export async function GET({ url, locals }) {
    if (!locals.user) {
        throw error(401, "Unauthorized");
    }

    const take = z.coerce.number().int().positive().max(100).default(20).safeParse(url.searchParams.get('take'));
    const after = z.cuid2().optional().safeParse(url.searchParams.get('after'));
    const order = orderFilterSchema.optional().safeParse(url.searchParams.get('order'));

    const likes = await prisma.trackLike.findMany({
        where: {
            userId: locals.user?.id,
            track: {
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
            }
        },
        select: {
            track: {
                include: {
                    release: {
                        select: {
                            id: true,
                            name: true,
                            cover: true
                        }
                    }
                }
            }
        },
        take: take.data || 20,
        skip: after.data ? 1 : 0,
        cursor: after.data
            ? {
                trackId_userId: {
                    trackId: after.data,
                    userId: locals.user.id
                }
            }
            : undefined,
        orderBy: {
            createdAt: order.data === 'asc' ? 'asc' : 'desc'
        }
    }) as GETResponse;

    return json(likes.map(like => like.track));
}
