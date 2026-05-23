import { error, redirect } from '@sveltejs/kit';
import { createAuthRedirect } from '$lib/helpers/utils';
import { prisma } from '$lib/server/prisma.js';

export async function load({ locals, url, params }) {
    if (!locals.session?.user) {
        throw redirect(302, createAuthRedirect('signin', url));
    }

    const post = await prisma.post.findUnique({
        where: {
            id: params.postId
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
                include: {
                    id: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    }
                }
            },
            _count: {
                select: {
                    likes: true
                }
            }
        },
        cacheStrategy: {
            ttl: 120,
            swr: 60
        }
    });

    if (!post) {
        throw error(404, 'Post not found');
    }

    return { post };
}
