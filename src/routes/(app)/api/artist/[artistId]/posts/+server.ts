import { json } from '@sveltejs/kit';
import z from 'zod';
import { prisma } from '$lib/server/prisma.js';
import type { Post } from '$lib/server/prisma/browser';
import type { PartialUser } from '$lib/helpers/utils';
import { error } from '@sveltejs/kit';

export type GETResponse = (Post & {
    user: PartialUser;
    reference: {
        id: string;
        user: PartialUser;
    }|null;
    _count: {
        likes: number;
        replies: number;
    };
})[];

export async function GET({ locals, url, params }) {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const after = z.string().optional().safeParse(url.searchParams.get('after'));
    const replies = z.coerce.boolean().default(false).safeParse(url.searchParams.get('replies'));
    const take = z.coerce.number().int().positive().max(100).default(20).safeParse(url.searchParams.get('take'));

    const posts = await prisma.post.findMany({
        where: {
            userId: params.artistId,
            referenceId: replies.data ? undefined : null
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true
                }
            },
            reference: {
                select: {
                    id: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    },
                }
            },
            _count: {
                select: {
                    likes: true,
                    replies: true
                }
            }
        },
        cursor: after.data ? { id: after.data } : undefined,
        skip: after.data ? 1 : undefined,
        take: take.data,
        orderBy: {
            createdAt: 'desc'
        }
    });

    return json(posts);
}
