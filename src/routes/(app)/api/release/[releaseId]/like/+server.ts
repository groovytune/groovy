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

    const data = await prisma.$transaction(async (tx) => {
        const result = await tx.releaseLike.findUnique({
            where: {
                releaseId_userId: {
                    releaseId: params.releaseId,
                    userId: locals.user!.id
                }
            }
        });

        return result ?? await tx.releaseLike.create({
            data: {
                userId: locals.user!.id,
                releaseId: params.releaseId
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
        const hasLiked = await tx.releaseLike.findUnique({
            where: {
                releaseId_userId: {
                    releaseId: params.releaseId,
                    userId: locals.user!.id
                }
            }
        });

        if (!hasLiked) return;

        await tx.releaseLike.delete({
            where: {
                releaseId_userId: {
                    releaseId: params.releaseId,
                    userId: locals.user!.id
                }
            }
        });
    });

    return json({ success: true });
}
