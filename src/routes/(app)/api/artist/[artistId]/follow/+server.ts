import { error, json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET({ params, locals }) {
    if (!locals.user) {
        return error(401, 'Unauthorized');
    }

    const data = await prisma.userFollow.findUnique({
        where: {
            followerId_userId: {
                userId: params.artistId,
                followerId: locals.user.id
            }
        }
    });

    return json({
        following: !!data,
        data: data
    });
}

export async function POST({ params, locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (params.artistId === locals.user.id) {
        throw error(400, 'You cannot follow yourself');
    }

    const data = await prisma.$transaction(async (tx) => {
        const result = await tx.userFollow.findUnique({
            where: {
                followerId_userId: {
                    userId: params.artistId,
                    followerId: locals.user!.id
                }
            }
        });

        return result ?? await tx.userFollow.create({
            data: {
                userId: params.artistId,
                followerId: locals.user!.id
            }
        })
    });

    return json(data);
}

export async function DELETE({ params, locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (params.artistId === locals.user.id) {
        throw error(400, 'You cannot unfollow yourself');
    }

    await prisma.$transaction(async (tx) => {
        const isFollowing = await tx.userFollow.findUnique({
            where: {
                followerId_userId: {
                    userId: params.artistId,
                    followerId: locals.user!.id
                }
            }
        });

        if (!isFollowing) return;

        await tx.userFollow.delete({
            where: {
                followerId_userId: {
                    userId: params.artistId,
                    followerId: locals.user!.id
                }
            }
        });
    });

    return json({ success: true });
}
