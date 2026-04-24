import { redirect } from '@sveltejs/kit';
import { createAuthRedirect } from '$lib/helpers/utils.js';
import { prisma } from '$lib/server/prisma.js';
import { resolve } from '$app/paths';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { editTrackSchema } from '$lib/schema/track.js';
import { Appwrite } from '$lib/server/appwrite';
import { definePageMetaTags } from 'svelte-meta-tags';

export async function load({ params, locals, url }) {
    if (!locals.session) {
        throw redirect(302, createAuthRedirect('signin', url));
    }

    const track = await prisma.track.findUnique({
        where: {
            id: params.trackId,
            release: {
                id: params.id,
                userId: locals.session.user.id
            }
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

    if (!track) {
        throw redirect(302, resolve('/(app)/release/[id]/edit/tracks', { id: params.id }));
    }

    const form = await superValidate({
        name: track.name,
        explicit: track.explicit,
        genres: track.genres,
    }, zod4(editTrackSchema));

    const title = `Groovy | Edit Track • ${track.name}`;
    const description = `Edit the track ${track.name} in your release.`;

    return {
        track,
        form,
        ...definePageMetaTags({
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'website',
            }
        })
    };
}

export const actions = {
    edit: async ({ request, params, locals }) => {
        if (!locals.user) {
            return fail(401, { message: 'Unauthorized' });
        }

        const form = await superValidate(request, zod4(editTrackSchema), {
            allowFiles: true
        });

        if (!form.valid) {
            return fail(400, { form, message: 'Please correct the errors in the form' });
        }

        const cover = form.data.cover
            ? await Appwrite.uploadFile(form.data.cover, 'image')
            : null;

        const track = await prisma.track.update({
            where: {
                id: params.trackId,
                release: {
                    id: params.id,
                    userId: locals.user.id
                }
            },
            data: {
                name: form.data.name,
                explicit: form.data.explicit,
                cover: cover?.$id,
                genres: {
                    set: form.data.genres?.map(g => ({ id: g.id }))
                }
            }
        });

        return message(form, {
            message: 'Track updated successfully',
            track
        });
    }
};
