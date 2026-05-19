import { error } from '@sveltejs/kit';
import { Appwrite } from '$lib/server/appwrite';
import { prisma } from '$lib/server/prisma';

export async function GET({ params, url, locals, request }) {
    const file = await Appwrite.storage.getFile({
        bucketId: 'audio',
        fileId: params.fileId
    }).catch(() => null);

    if (!file) {
        throw error(404, 'File not found');
    }

    const data = await Appwrite.storage.getFileDownload({
        bucketId: 'audio',
        fileId: params.fileId
    });

    prisma.track
        .findUnique({
            where: {
                file: params.fileId
            }
        })
        .then(async (track) => {
            if (!track) return;

            await countStream({
                trackId: track.id,
                hostname: request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || undefined,
                userAgent: request.headers.get('user-agent') || undefined,
                userId: locals.user?.id
            });
        })
        .catch(() => null);

    const fileSize = file.sizeOriginal;
    const rangeHeader = request.headers.get('range');

    const headers = new Headers({
        'Content-Type': file.mimeType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=300, immutable',
        'Content-Length': fileSize.toString()
    });

    if (url.searchParams.has('download')) {
        headers.set('Content-Disposition', `attachment; filename="${file.name}"`);
    }

    let start = 0;
    let end = fileSize - 1;

    if (rangeHeader) {
        const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);

        if (match) {
            start = parseInt(match[1], 10);
            end = match[2] ? parseInt(match[2], 10) : fileSize - 1;
        }
    }

    if (start >= 0 && end < fileSize && start <= end) {
        const contentLength = end - start + 1;

        headers.set('Content-Length', contentLength.toString());
        headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);

        return new Response(data.slice(start, end + 1), {
            status: 206,
            headers
        });
    }

    return new Response(data, {
        headers
    });
}

interface StreamOptions {
    trackId: string;
    hostname?: string;
    userAgent?: string;
    userId?: string;
}

async function countStream(options: StreamOptions): Promise<boolean> {
    const stream = await prisma.stream.findFirst({
        where: {
            trackId: options.trackId,
            hostname: options.hostname,
            userAgent: options.userAgent,
            userId: options.userId,
            createdAt: {
                gte: new Date(Date.now() - 5 * 60 * 1000)
            }
        },
        cacheStrategy: {
            swr: 60,
            ttl: 2 * 60
        }
    });

    if (stream) return false;

    await prisma.stream.create({
        data: {
            trackId: options.trackId,
            hostname: options.hostname,
            userAgent: options.userAgent,
            userId: options.userId
        }
    });

    return true;
}

