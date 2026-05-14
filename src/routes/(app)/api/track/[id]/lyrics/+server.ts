import { prisma } from '$lib/server/prisma';
import { error, json } from '@sveltejs/kit';

export async function GET({ params, locals }) {
    const lyrics = await prisma.lyrics.findFirst({
        where: {
            track: {
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
            }
        }
    });

    if (!lyrics) {
        throw error(404, 'Track not found');
    }

    return json(lyrics);
}
