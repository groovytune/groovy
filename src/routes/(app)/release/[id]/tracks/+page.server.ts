import { error, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import { Appwrite } from '../../../../../lib/server/appwrite.js';
import { ImageFormat } from 'node-appwrite';

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
        ? await Appwrite.storage.getFilePreview({
            bucketId: 'image',
            fileId: release.cover,
            output: ImageFormat.Webp,
            width: 300,
            height: 300,
            quality: 100
        }).then((url) => `data:image/webp;base64,${Buffer.from(url).toString('base64')}`)
        : null;

    return { release };
}
