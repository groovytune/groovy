import { error, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import { Appwrite } from '$lib/server/appwrite.js';
import { ImageFormat } from 'node-appwrite';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { editTracksSchema, uploadTracksSchema } from '$lib/schema/track.js';
import type { Actions } from './$types.js';
import { fail } from 'sveltekit-superforms';

export async function load({ params, locals }) {
    const { id } = params;

    if (!locals.user) {
        throw redirect(302, '/login');
    }

    const release = await prisma.release.findUnique({
        where: {
            id,
            userId: locals.user.id
        },
        include: {
            tracks: true
        }
    });

    if (!release) {
        throw error(404, 'Release not found');
    }

    release.cover = release.cover
        ? await Appwrite.createImagePreviewURL({
            bucketId: 'image',
            fileId: release.cover,
            output: ImageFormat.Webp,
            width: 300,
            height: 300,
            quality: 100
        })
        : null;

    const tracksForm = await superValidate({
        tracks: release.tracks
    }, zod4(editTracksSchema), {
        id: 'tracklist-form'
    });

    const tracksUploadForm = await superValidate({
        tracks: []
    }, zod4(uploadTracksSchema), {
        id: 'tracks-upload-form'
    });

    return { release, tracksForm, tracksUploadForm };
}

export const actions = {
    upload: async ({ request, locals, params }) => {
        const form = await superValidate(request, zod4(uploadTracksSchema));

        if (!form.valid) {
            return fail(400, { form });
        }

        if (!locals.user) {
            throw redirect(302, '/login');
        }

        const release = await prisma.release.findUnique({
            where: {
                id: params.id,
                userId: locals.user.id
            },
            include: {
                tracks: true
            }
        });

        if (!release) {
            throw error(404, 'Release not found');
        }

        const uploaded = await Promise.all(
            form.data.tracks
                .map(async t => {
                    const file = await Appwrite
                        .uploadFile(t.file, 'audio')
                        .catch(() => null);

                    const cover = t.cover
                        ? await Appwrite
                            .uploadFile(t.cover, 'image')
                            .catch(() => null)
                        : null;

                    return { 
                        id: t.file.name,
                        track: t,
                        cover,
                        file
                    };
                })
        );

        const tracks = await prisma.track.createManyAndReturn({
            data: uploaded
                .filter(t => t.file)
                .map(t => ({
                    name: t.track.name,
                    cover: t.cover?.$id,
                    file: t.file!.$id,
                    explicit: t.track.explicit,
                    duration: t.track.duration,
                    metadata: t.track.metadata,
                    releaseId: release.id
                }))
        }).catch(async err => {
            await Promise.all(
                uploaded.map(async t => {
                    if (t.file) {
                        await Appwrite.storage
                            .deleteFile({
                                fileId: t.file.$id,
                                bucketId: t.file.bucketId
                            })
                            .catch(() => null);
                    }

                    if (t.cover) {
                        await Appwrite.storage
                            .deleteFile({
                                fileId: t.cover.$id,
                                bucketId: t.cover.bucketId
                            })
                            .catch(() => null);
                    }
                })
            );

            console.error('Error creating tracks:', err);
            throw err;
        });

        return message(form, {
            text: `Successfully uploaded ${tracks.length} track(s)`,
            tracks
        }, { removeFiles: true })
    }
} satisfies Actions;
