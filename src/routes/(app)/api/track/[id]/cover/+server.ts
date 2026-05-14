import { prisma } from '$lib/server/prisma';
import coverPlaceholder from '$lib/assets/cover.webp';
import { Appwrite } from '$lib/server/appwrite';
import { ImageFormat, ImageGravity } from 'node-appwrite';
import type { Track } from '$lib/server/prisma/client.js';

export async function GET({ params, locals, url, fetch }) {
    const track = await prisma.track.findUnique({
        where: {
            id: params.id,
            release: {
                AND: locals.user?.id
                    ? {
                        OR: [
                            { privacy: 'PRIVATE', userId: locals.user?.id },
                            { privacy: { not: 'PRIVATE' } }
                        ]
                    }
                    : { privacy: { not: 'PRIVATE' } }
            }
        },
        select: {
            cover: true,
            release: {
                select: {
                    cover: true
                }
            }
        }
    }) as Track & {
        release: Record<'cover', string|null>;
    };

    const size = url.searchParams.get('size');

    const cover = track?.cover ?? track?.release.cover
        ? await Appwrite.storage.getFilePreview({
            bucketId: 'image',
            fileId: (track.cover ?? track.release.cover)!,
            width: size ? parseInt(size) : undefined,
            height: size ? parseInt(size) : undefined,
            gravity: ImageGravity.Center,
            output: ImageFormat.Webp
        }).catch(() => Appwrite.storage.getFileView({ bucketId: 'image', fileId: (track.cover ?? track.release.cover)! }))
        : await fetch(coverPlaceholder).then(res => res.arrayBuffer());

    return new Response(cover, {
        headers: {
            'Content-Type': 'image/webp'
        }
    });
}
