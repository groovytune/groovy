import { error, json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET({ params, locals }) {
    if (!locals.user) {
        return error(401, 'Unauthorized');
    }

    const data = await prisma.userFollow.findUnique({
        where: {
            followerId_userId: {
                userId: locals.user.id,
                followerId: params.artistId
            }
        }
    });

    return json({
        follower: !!data,
        data: data
    });
}

export async function DELETE({ params, locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (params.artistId === locals.user.id) {
        throw error(400, 'You cannot unfollow yourself');
    }

    await prisma.$transaction(async (tx) => {
        const isFollower = await tx.userFollow.findUnique({
            where: {
                followerId_userId: {
                    userId: locals.user!.id,
                    followerId: params.artistId
                }
            }
        });

        if (!isFollower) return;

        await tx.userFollow.delete({
            where: {
                followerId_userId: {
                    userId: locals.user!.id,
                    followerId: params.artistId
                }
            }
        });
    });

    return json({ success: true });
}
