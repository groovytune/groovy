import { error, json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET({ params, locals }) {
    if (!locals.user) {
        return error(401, 'Unauthorized');
    }

    const data = await prisma.trackLike.findUnique({
        where: {
            trackId_userId: {
                trackId: params.trackId,
                userId: locals.user.id
            },
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

    let data = await prisma.trackLike.findUnique({
        where: {
            trackId_userId: {
                trackId: params.trackId,
                userId: locals.user.id
            }
        }
    });

    data ??= await prisma.trackLike.create({
        data: {
            userId: locals.user.id,
            trackId: params.trackId
        }
    });

    return json(data);
}

export async function DELETE({ params, locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasLiked = await prisma.trackLike.findUnique({
        where: {
            trackId_userId: {
                trackId: params.trackId,
                userId: locals.user.id
            }
        }
    });

    if (hasLiked) {
        await prisma.trackLike.delete({
            where: {
                trackId_userId: {
                    trackId: params.trackId,
                    userId: locals.user.id
                }
            }
        });
    }

    return json({ success: true });
}
