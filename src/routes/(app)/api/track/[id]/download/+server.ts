import { error } from '@sveltejs/kit';
import { prisma } from '../../../../../../lib/server/prisma.js';
import { Appwrite } from '../../../../../../lib/server/appwrite.js';

export async function GET({ locals, params }) {
    const { id } = params;

    const track = await prisma.track.findUnique({
        where: {
            id,
            AND: locals.user?.id
                ? {
                    OR: [
                        {
                            release: {
                                privacy: { not: 'PRIVATE' }
                            }
                        },
                        {
                            release: {
                                userId: locals.user?.id
                            }
                        }
                    ],
                }
                : {
                    release: {
                        privacy: { not: 'PRIVATE' }
                    }
                }
        },
        select: {
            file: true,
        },
    });

    if (!track) {
        throw error(404, 'Track not found');
    }

    const file = await Appwrite.storage.getFile({
        bucketId: 'audio',
        fileId: track.file,
    });

    const data = await Appwrite.storage.getFileView({
        bucketId: 'audio',
        fileId: track.file,
    });

    return new Response(data, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${file.name}"`,
            'Content-Length': `${data.byteLength}`,
        },
    });
}
