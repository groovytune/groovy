import { Appwrite } from '$lib/server/appwrite.js';
import { imageTransformOptionsSchema } from '$lib/schema/image.js';
import { ImageTransform } from '$lib/helpers/classes/ImageTransform.js';

export async function GET({ params, url }) {
    const meta = await Appwrite.storage.getFile({
        bucketId: 'image',
        fileId: params.fileId
    });

    const data = await Appwrite.storage.getFileView({
        bucketId: 'image',
        fileId: params.fileId
    });

    const options = imageTransformOptionsSchema.safeParse(Object.fromEntries(url.searchParams.entries())).data;
    const output = await ImageTransform.transform(data, options);

    const headers = new Headers({
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': (options?.output && ImageTransform.mimeTypes[options?.output]) || meta.mimeType
    });

    if (options?.download) {
        headers.set('Content-Disposition', `attachment; filename="${meta.name}"`);
    }

    return new Response(output, { headers });
}
