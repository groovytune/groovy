import { Appwrite } from '$lib/server/appwrite.js';

export async function GET({ params, url }) {
    const isDownload = url.searchParams.get('download') !== null;
    const bucketId = url.searchParams.get('bucketId') || 'image';

    const meta = await Appwrite.storage.getFile({
        bucketId,
        fileId: params.fileId
    });

    const data = await Appwrite.storage.getFileView({
        bucketId,
        fileId: params.fileId
    });

    const headers = new Headers({
        'Content-Type': meta.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable'
    });

    if (isDownload) {
        headers.set('Content-Disposition', `attachment; filename="${meta.name}"`);
    }

    return new Response(data, { headers });
}
