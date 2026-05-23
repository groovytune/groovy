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

export async function GET({ locals, url }) {
    const after = z.string().optional().safeParse(url.searchParams.get('after'));
    const take = z.coerce.number().int().positive().max(100).default(20).safeParse(url.searchParams.get('take'));

    const posts = await prisma.post.findMany({
        where: {
            AND: locals.user?.id
                ? {
                    OR: [
                        { userId: locals.user.id },
                        {
                            user: {
                                followers: {
                                    some: {
                                        followerId: locals.user.id
                                    }
                                }
                            }
                        },
                        {
                            likes: {
                                some: {
                                    user: {
                                        followers: {
                                            some: {
                                                followerId: locals.user.id
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            replies: {
                                some: {
                                    user: {
                                        followers: {
                                            some: {
                                                followerId: locals.user.id
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
                : undefined
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
