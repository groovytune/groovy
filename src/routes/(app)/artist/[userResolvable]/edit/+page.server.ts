import { prisma } from '$lib/server/prisma.js';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { editUserSchema } from '$lib/schema/user.js';

export async function load({ params, locals }) {
    const { userResolvable } = params;

    const user = await prisma.user.findUnique({
        where: userResolvable.startsWith('@')
            ? { username: userResolvable.slice(1) }
            : { id: userResolvable },
        include: {
            favoriteTrack: true,
            genres: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    if (!user) {
        throw error(404, 'Artist not found');
    }

    if (user.id !== locals.user?.id) {
        throw error(403, 'Forbidden');
    }

    const form = await superValidate(
        {
            name: user.name,
            username: user.username ?? undefined,
            bio: user.bio ?? undefined,
            favoriteTrackId: user.favoriteTrack?.id,
            genres: user.genres,
            image: undefined
        },
        zod4(editUserSchema),
        { allowFiles: true }
    );

    return { user, form };
}
