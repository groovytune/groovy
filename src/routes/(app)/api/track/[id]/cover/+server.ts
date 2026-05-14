import { prisma } from '$lib/server/prisma';
import coverPlaceholder from '$lib/assets/cover.webp';
import { ImageFormat, ImageGravity } from 'node-appwrite';
import type { Track } from '$lib/server/prisma/client.js';
import { Image } from '$lib/client/image.js';
import { redirect } from '@sveltejs/kit';

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

    if (track.cover || track.release.cover) {
        redirect(307, Image.getPreviewPath({
            fileId: (track.cover ?? track.release.cover)!,
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
