import { error, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import { Appwrite } from '$lib/server/appwrite.js';
import { ImageFormat } from 'node-appwrite';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { newTrackSchema, sortTracksSchema, trackFileSchema, uploadTracksSchema } from '$lib/schema/track.js';
import type { Actions } from './$types.js';
import { fail } from 'sveltekit-superforms';
import { extractFileMetadata, getPartialMetadata } from '$lib/helpers/metadata.js';
import type z from 'zod';

export async function load({ params, locals }) {
    const { id } = params;

    if (!locals.user) {
        throw redirect(302, '/signin');
    }

    const release = await prisma.release.findUnique({
        where: {
            id,
            userId: locals.user.id,
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
            width: 500,
            height: 500,
            quality: 100
        })
        : null;

    const sortTracksForm = await superValidate(
        { tracks: release.tracks.map(t => ({ id: t.id, position: t.position })) },
        zod4(sortTracksSchema)
    );

    const uploadTracksForm = await superValidate(zod4(uploadTracksSchema));

    return {
        release,
        sortTracksForm,
        uploadTracksForm
    };
}

export const actions = {
    upload: async ({ request, locals, params }) => {
        const form = await superValidate(
            request,
            zod4(uploadTracksSchema)
        );

        if (!form.valid) {
            console.log('Uploaded files validation failed:', form.data.files, form.errors.files);
            return fail(400, { form, message: 'Uploaded files are invalid.' });
        }

        if (!locals.user) {
            throw redirect(302, '/signin');
        }

        const release = await prisma.release.findUnique({
            where: {
                id: params.id,
                userId: locals.user.id
            },
            select: {
                id: true
            }
        });

        if (!release) {
            throw fail(404, { form, message: 'Release not found.' });
        }

        const files: File[] = Array.isArray(form.data.files)
            ? form.data.files
            : Array.from(form.data.files as FileList);

        const invalid: { file: File; reason?: string; }[] = [];
        const tracks: (z.infer<typeof newTrackSchema>|null)[] = await Promise.all(
            files
                .map(async file => {
                    if (!trackFileSchema.safeParse(file).success) {
                        invalid.push({ file, reason: 'Unsupported audio format' });
                        return null;
                    }

                    const metadata = await extractFileMetadata(file)
                        .catch(err => {
                            invalid.push({ file, reason: String(err) });
                            console.error(`Error extracting metadata from file ${file.name}:`, err);
                            return null;
                        });

                    if (!metadata) {
                        return null;
                    }

                    const cover: File|null = metadata.cover
                        ? new File(
                            [
                                metadata.cover.data instanceof Uint8Array
                                    ? metadata.cover.data.buffer instanceof ArrayBuffer
                                        ? new Uint8Array(metadata.cover.data).buffer
                                        : metadata.cover.data
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    : metadata.cover.data as any
                            ],
                            `cover.${metadata.cover.format.split('/')[1]?.toLowerCase() || 'jpg'}`,
                            { type: metadata.cover.format }
                        )
                        : null;

                    const raw = {
                        name: metadata.common.title || file.name,
                        cover,
                        file,
                        explicit: false,
                        duration: metadata.duration || null,
                        metadata: getPartialMetadata(metadata)
                    };

                    const data = newTrackSchema.safeParse(raw);

                    if (!data.success) {
                        invalid.push({ file, reason: data.error.message });
                        console.error(`Metadata validation failed for file ${file.name}:`, data.error, raw);
                        return null;
                    }

                    return data.success ? data.data : null;
                })
        );

        const uploaded = await Promise.all(
            tracks
                .filter(track => track !== null)
                .map(async track => {
                    const file = await Appwrite
                        .uploadFile(track.file, 'audio')
                        .catch(() => null);

                    const cover = track.cover
                        ? await Appwrite
                            .uploadFile(track.cover, 'image')
                            .catch(() => null)
                        : null;

                    return { 
                        id: track.file.name,
                        track: track,
                        cover,
                        file
                    };
                })
        );

        const data = uploaded
            .filter(t => t.file)
            .map(t => ({
                name: t.track.name,
                position: 0,
                cover: t.cover?.$id,
                file: t.file!.$id,
                explicit: t.track.explicit,
                duration: t.track.duration ?? null,
                metadata: t.track.metadata,
                releaseId: release.id
            }));

        const created = await prisma.track
            .createManyAndReturn({ data })
            .catch(async err => {
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
            message: `Successfully uploaded ${created.length} track${created.length > 1 ? 's' : ''}`,
            tracks: created,
            invalid
        }, { removeFiles: true })
    },
    sort: async ({ request, locals, params }) => {
        const form = await superValidate(
            request,
            zod4(sortTracksSchema)
        );

        if (!form.valid) {
            return fail(400, { form, message: 'Tracks data are invalid.' });
        }

        if (!locals.user) {
            throw redirect(302, '/signin');
        }

        const tracks = await prisma.$transaction(
            form.data.tracks
                .map(track => prisma.track.update({
                    where: {
                        release: {
                            id: params.id,
                            userId: locals.user!.id
                        },
                        id: track.id
                    },
                    data: {
                        position: track.position
                    },
                    select: {
                        id: true,
                        position: true
                    }
                }))
        );

        return message(form, {
            message: `Successfully updated order of ${tracks.length} track${tracks.length > 1 ? 's' : ''}`,
            tracks
        });
    }
} satisfies Actions;
