import { prisma } from '$lib/server/prisma';
import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export async function GET({ params, locals }) {
    const track = await prisma.track.findUnique({
        where: {
            id: params.id,
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
        },
        select: {
            id: true,
            file: true
        }
    });

    if (!track) {
        throw error(404, 'Track not found');
    }

    redirect(307, resolve('/(app)/api/assets/audio/[fileId]', { fileId: track.file }));
}
