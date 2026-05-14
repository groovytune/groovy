import { prisma } from '$lib/server/prisma';
import coverPlaceholder from '$lib/assets/cover.webp';
import { Appwrite } from '$lib/server/appwrite';
import { ImageFormat, ImageGravity } from 'node-appwrite';

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

    const cover = release?.cover
        ? await Appwrite.storage.getFilePreview({
            bucketId: 'image',
            fileId: release.cover,
            width: size ? parseInt(size) : undefined,
            height: size ? parseInt(size) : undefined,
            gravity: ImageGravity.Center,
            output: ImageFormat.Webp
        }).catch(() => Appwrite.storage.getFileView({ bucketId: 'image', fileId: release.cover! }))
        : await fetch(coverPlaceholder).then(res => res.arrayBuffer());

    return new Response(cover, {
        headers: {
            'Content-Type': 'image/webp'
        }
    });
}
