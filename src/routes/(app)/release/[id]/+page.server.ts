import { error, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import { Appwrite } from '$lib/server/appwrite.js';
import { ImageFormat } from 'node-appwrite';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { editTracklistSchema } from '../../../../lib/schema/track.js';

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

    const form = await superValidate({
        releaseId: release.id,
        tracks: release.tracks
    }, zod4(editTracklistSchema));

    return { release, form };
}
