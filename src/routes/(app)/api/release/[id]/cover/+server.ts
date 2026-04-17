import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import { Appwrite } from '$lib/server/appwrite.js';
import cover from '$lib/assets/cover.webp';

export async function GET({ locals, params, url, fetch }) {
    const { id } = params;

    const track = await prisma.release.findUnique({
        where: {
            id,
            AND: locals.user?.id
                ? {
                    OR: [
                        {
                            privacy: { not: 'PRIVATE' }
                        },
                        {
                            userId: locals.user?.id
                        }
                    ],
                }
                : {
                    privacy: { not: 'PRIVATE' }
                }
        },
        select: {
            cover: true,
        },
    });

    if (!track) {
        throw error(404, 'Release cover not found');
    }

    if (!track.cover) {
        const response = await fetch(cover);
        const blob = await response.blob();

        return new Response(blob, {
            headers: {
                'Content-Type': 'image/webp',
                'Content-Disposition': `inline; filename="cover.webp"`,
                'Content-Length': `${blob.size}`,
            },
        });
    }

    const qualityParam = parseInt(url.searchParams.get('quality') ?? '100');
    const quality = !isNaN(qualityParam) && qualityParam >= 1 && qualityParam <= 100 ? qualityParam : 100;

    const file = await Appwrite.storage.getFile({
        bucketId: 'image',
        fileId: track.cover,
    });

    const data = await Appwrite.storage.getFilePreview({
        bucketId: 'image',
        fileId: track.cover,
        quality
    });

    return new Response(data, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${file.name}"`,
            'Content-Length': `${data.byteLength}`,
        },
    });
}
