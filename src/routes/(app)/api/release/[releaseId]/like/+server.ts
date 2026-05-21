import { error, json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET({ params, locals }) {
    if (!locals.user) {
        return error(401, 'Unauthorized');
    }

    const data = await prisma.releaseLike.findUnique({
        where: {
            releaseId_userId: {
                releaseId: params.releaseId,
                userId: locals.user?.id ?? ''
            },
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

    let data = await prisma.releaseLike.findUnique({
        where: {
            releaseId_userId: {
                releaseId: params.releaseId,
                userId: locals.user.id
            }
        }
    });

    data ??= await prisma.releaseLike.create({
        data: {
            userId: locals.user.id,
            releaseId: params.releaseId
        }
    });

    return json(data);
}

export async function DELETE({ params, locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasLiked = await prisma.releaseLike.findUnique({
        where: {
            releaseId_userId: {
                releaseId: params.releaseId,
                userId: locals.user.id
            }
        }
    });

    if (hasLiked) {
        await prisma.releaseLike.delete({
            where: {
                releaseId_userId: {
                    releaseId: params.releaseId,
                    userId: locals.user.id
                }
            }
        });
    }

    return json({ success: true });
}
