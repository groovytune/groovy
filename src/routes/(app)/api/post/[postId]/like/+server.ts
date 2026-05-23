import { error, json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET({ params, locals }) {
    if (!locals.user) {
        return error(401, 'Unauthorized');
    }

    const data = await prisma.postLike.findUnique({
        where: {
            postId_userId: {
                postId: params.postId,
                userId: locals.user?.id ?? ''
            }
        }
    });

    return json({
        liked: !!data,
        data: data
    });
}

export async function POST({ params, locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await prisma.$transaction(async (tx) => {
        const result = await tx.postLike.findUnique({
            where: {
                postId_userId: {
                    postId: params.postId,
                    userId: locals.user!.id
                }
            }
        });

        return result ?? await tx.postLike.create({
            data: {
                userId: locals.user!.id,
                postId: params.postId
            }
        })
    });

    return json(data);
}

export async function DELETE({ params, locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
        const hasLiked = await tx.postLike.findUnique({
            where: {
                postId_userId: {
                    postId: params.postId,
                    userId: locals.user!.id
                }
            }
        });

        if (!hasLiked) return;

        await tx.postLike.delete({
            where: {
                postId_userId: {
                    postId: params.postId,
                    userId: locals.user!.id
                }
            }
        });
    });

    return json({ success: true });
}
