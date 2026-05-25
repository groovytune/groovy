import { prisma } from '$lib/server/prisma.js';
import { error } from '@sveltejs/kit';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { editUserSchema } from '$lib/schema/user.js';
import { Appwrite } from '$lib/server/appwrite';
import path from 'node:path';
import { Image } from '$lib/client/image.js';
import { ImageFormat } from 'node-appwrite';

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
            favoriteTrack: user.favoriteTrack
                ? {
                    ...user.favoriteTrack,
                    createdAt: user.favoriteTrack?.createdAt.toISOString(),
                    updatedAt: user.favoriteTrack?.updatedAt.toISOString()
                }
                : undefined,
            genres: user.genres,
            image: undefined
        },
        zod4(editUserSchema),
        { allowFiles: true }
    );

    return { user, form };
}

export const actions = {
    update: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { message: 'Unauthorized' });
        }

        const form = await superValidate(request, zod4(editUserSchema), {
            allowFiles: true
        });

        if (!form.valid) {
            return fail(400, { form, message: 'Please correct the errors in the form' });
        }

        const avatar = form.data.image
            ? await Appwrite.uploadFile(form.data.image, 'avatar')
            : null;

        await prisma.user.update({
            where: {
                id: locals.user.id
            },
            data: {
                name: form.data.name,
                username: form.data.username,
                bio: form.data.bio,
                favoriteTrackId: form.data.favoriteTrack?.id,
                genres: {
                    set: form.data.genres.map(genre => ({ id: genre.id }))
                },
                image: avatar
                    ? path.resolve(
                        '/',
                        Image.getPreviewPath({
                            fileId: avatar.$id,
                            bucketId: avatar.bucketId,
                            width: 500,
                            height: 500,
                            output: ImageFormat.Webp
                        })
                    )
                    : undefined
            }
        });

        return message(form, { message: 'Profile updated successfully' });
    }
};
