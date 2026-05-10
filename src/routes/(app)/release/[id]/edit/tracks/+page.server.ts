import { error, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import { Appwrite } from '$lib/server/appwrite.js';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { deleteTracksSchema, newTrackSchema, sortTracksSchema, trackFileSchema, uploadTracksSchema } from '$lib/schema/track.js';
import type { Actions } from './$types.js';
import { fail } from 'sveltekit-superforms';
import { extractFileMetadata, getPartialMetadata } from '$lib/helpers/metadata.js';
import type z from 'zod';
import { definePageMetaTags } from 'svelte-meta-tags';
import { createAuthRedirect } from '$lib/helpers/utils.js';

export async function load({ params, locals, url }) {
    const { id } = params;

    if (!locals.user) {
        throw redirect(302, createAuthRedirect('signin', url));
    }

    const release = await prisma.release.findUnique({
        where: {
            id,
            userId: locals.user.id,
        },
        include: {
            tracks: true,
            user: {
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

    const sortTracksForm = await superValidate(
        { tracks: release.tracks.map(t => ({ id: t.id, position: t.position })) },
        zod4(sortTracksSchema)
    );

    const uploadTracksForm = await superValidate(
        { files: null },
        zod4(uploadTracksSchema)
    );

    const title = `Groovy | Manage Tracks • ${release.name}`;
    const description = `Manage the tracks of your release ${release.name}.`;

    return {
        release,
        sortTracksForm,
        uploadTracksForm,
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
    upload: async ({ request, locals, params, url }) => {
        const formData = await request.formData();
        const form = await superValidate(
            formData,
            zod4(uploadTracksSchema)
        );

        if (!form.valid) {
            return fail(400, { form, message: 'Uploaded files are invalid.' });
        }

        if (!locals.user) {
            throw redirect(302, createAuthRedirect('signin', url));
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

        const files: File[] = (form.data.files ?? []) as File[];
        const invalid: { file: string; reason?: string; }[] = [];
        const tracks: (z.infer<typeof newTrackSchema>|null)[] = await Promise.all(
            files
                .map(async file => {
                    if (!trackFileSchema.safeParse(file).success) {
                        invalid.push({ file: file.name, reason: 'Unsupported audio format' });
                        return null;
                    }

                    const metadata = await extractFileMetadata(file)
                        .catch(err => {
                            invalid.push({ file: file.name, reason: String(err) });
                            console.error(`Error extracting metadata from file ${file.name}:`, err);
                            return null;
                        });

                    if (!metadata) {
                        return null;
                    }

                    const cover: File|undefined = metadata.cover
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
                        : undefined;

                    const raw: z.infer<typeof newTrackSchema> = {
                        name: metadata.common.title || file.name,
                        cover: cover,
                        file,
                        explicit: false,
                        duration: metadata.duration || null,
                        metadata: getPartialMetadata(metadata),
                        genres: []
                    };

                    const data = newTrackSchema.safeParse(raw);

                    if (!data.success) {
                        invalid.push({ file: file.name, reason: data.error.message });
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
    delete: async ({ request, locals, params, url }) => {
        const form = await superValidate(
            request,
            zod4(deleteTracksSchema)
        );

        if (!form.valid) {
            return fail(400, { form, message: 'Invalid track IDs.' });
        }

        if (!locals.user) {
            throw redirect(302, createAuthRedirect('signin', url));
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

        const tracks = await prisma.track.deleteMany({
            where: {
                id: { in: form.data.trackIds },
                releaseId: release.id
            }
        });

        if (!tracks.count) {
            return fail(404, { form, message: 'No tracks found to delete.' });
        }

        return message(form, {
            message: `Successfully deleted ${tracks.count} track${tracks.count > 1 ? 's' : ''}`,
            trackIds: form.data.trackIds
        });
    },
    sort: async ({ request, locals, params, url }) => {
        const form = await superValidate(
            request,
            zod4(sortTracksSchema)
        );

        if (!form.valid) {
            return fail(400, { form, message: 'Tracks data are invalid.' });
        }

        if (!locals.user) {
            throw redirect(302, createAuthRedirect('signin', url));
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
