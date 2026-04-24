import { error, redirect } from '@sveltejs/kit';
import { createAuthRedirect } from '$lib/helpers/utils.js';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { editReleaseSchema } from '$lib/schema/release';
import { prisma } from '$lib/server/prisma';
import { Appwrite } from '$lib/server/appwrite.js';
import { resolve } from '$app/paths';

export async function load({ locals, url, params }) {
    if (!locals.user) {
        throw redirect(302, createAuthRedirect('signin', url));
    }

    const release = await prisma.release.findUnique({
        where: {
            id: params.id,
            userId: locals.user.id
        },
        include: {
            genres: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    if (!release) {
        throw error(404, 'Release not found');
    }

    const form = await superValidate(
        {
            type: release.type,
            name: release.name,
            description: release.description ?? undefined,
            privacy: release.privacy,
            explicit: release.explicit,
            cover: undefined,
            genres: release.genres,
        },
        zod4(editReleaseSchema),
        { allowFiles: true }
    );

    return { form, release };
}

export const actions = {
    default: async ({ request, locals, params }) => {
        if (!locals.user) {
            return fail(401, { message: 'Unauthorized' });
        }

        const form = await superValidate(request, zod4(editReleaseSchema), {
            allowFiles: true
        });

        if (!form.valid) {
            return fail(400, { form, message: 'Please correct the errors in the form' });
        }

        const cover = form.data.cover
            ? await Appwrite.uploadFile(form.data.cover, 'image')
            : null;

        const release = await prisma.release.update({
            where: {
                id: params.id,
                userId: locals.user.id
            },
            data: {
                type: form.data.type,
                name: form.data.name,
                description: form.data.description,
                privacy: form.data.privacy,
                explicit: form.data.explicit,
                cover: cover?.$id,
                genres: {
                    set: form.data.genres?.map(g => ({ id: g.id }))
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

        return redirect(302, resolve(`/(app)/release/[id]/edit/tracks`, { id: release.id }));
    }
};
