import { fail, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { newReleaseSchema } from '$lib/schema/release.js';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { Appwrite } from '$lib/server/appwrite.js';
import { prisma } from '$lib/server/prisma.js';
import type z from 'zod';

export async function load({ locals, url }) {
    if (!locals.user) {
        throw redirect(302, resolve('/(auth)/signin'));
    }

    const form = await superValidate({
        type: url.searchParams.get('type')?.toUpperCase() as z.infer<typeof newReleaseSchema.shape.type>|undefined
    }, zod4(newReleaseSchema));

    return { form };
}

export const actions = {
    default: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { message: 'Unauthorized' });
        }

        const form = await superValidate(request, zod4(newReleaseSchema), {
            allowFiles: true
        });

        if (!form.valid) {
            return fail(400, { form });
        }

        const cover = form.data.cover
            ? await Appwrite.uploadFile(form.data.cover, 'image')
            : null;

        const release = await prisma.release.create({
            data: {
                userId: locals.user.id,
                type: form.data.type,
                name: form.data.name,
                description: form.data.description,
                privacy: form.data.privacy,
                explicit: form.data.explicit,
                cover: cover?.$id,
                genres: {
                    connect: form.data.genres
                        ?.map(genre => ({ id: genre.id }))
                },
            }
        }).catch(async error => {
            if (cover) {
                await Appwrite.storage
                    .deleteFile({ fileId: cover.$id, bucketId: cover.bucketId })
                    .catch(() => null);
            }

            throw error;
        });

        return redirect(302, resolve(`/release/${release.id}`));
    }
};
