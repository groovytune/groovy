import { json } from '@sveltejs/kit';
import z from 'zod';
import { prisma } from '$lib/server/prisma.js';
import type { Post } from '$lib/server/prisma/browser';
import type { PartialUser } from '$lib/helpers/utils';

export type GETResponse = (Post & {
    user: PartialUser;
    _count: {
        likes: number;
        replies: number;
    };
})[];

export async function GET({ url, params }) {
    const after = z.string().optional().safeParse(url.searchParams.get('after'));
    const take = z.coerce.number().int().positive().max(100).default(20).safeParse(url.searchParams.get('take'));

    const posts = await prisma.post.findMany({
        where: {
            referenceId: params.postId
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
