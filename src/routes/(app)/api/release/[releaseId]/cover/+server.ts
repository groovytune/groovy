import { prisma } from '$lib/server/prisma';
import coverPlaceholder from '$lib/assets/cover.webp';
import { ImageFormat, ImageGravity } from 'node-appwrite';
import { redirect } from '@sveltejs/kit';
import { Image } from '$lib/client/image.js';

export async function GET({ params, locals, url, fetch }) {
    const release = await prisma.release.findUnique({
        where: {
            id: params.releaseId,
            AND: locals.user?.id
                ? {
                    OR: [
                        { privacy: 'PRIVATE', userId: locals.user?.id },
                        { privacy: { not: 'PRIVATE' } }
                    ]
                }
                : { privacy: { not: 'PRIVATE' } }
        },
        select: {
            cover: true
        }
    });

    const size = url.searchParams.get('size');

    if (release?.cover) {
        redirect(307, Image.getPreviewPath({
            fileId: release.cover,
            width: size ? parseInt(size) : undefined,
            height: size ? parseInt(size) : undefined,
            gravity: ImageGravity.Center,
            output: ImageFormat.Webp
        }));
    }

    return new Response(await fetch(coverPlaceholder).then(res => res.arrayBuffer()), {
        headers: {
            'Content-Type': 'image/webp'
        }
    });
}
