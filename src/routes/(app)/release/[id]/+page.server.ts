import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import type { Release, Track } from '$lib/server/prisma/client.js';
import { definePageMetaTags } from 'svelte-meta-tags';
import { Appwrite } from '$lib/client/appwrite.js';
import { ImageFormat, ImageGravity } from 'appwrite';
import type { PartialUser } from '$lib/helpers/utils.js';

export type ReleasePageData = Release & {
    user: PartialUser;
    tracks: Track[];
};

export async function load({ params, locals }) {
    const { id } = params;

    const release = await prisma.release.findUnique({
        where: {
            id,
            AND: locals.user
                ? {
                    OR: [
                        { userId: locals.user.id },
                        { privacy: { not: 'PRIVATE' } }
                    ]
                }
                : { privacy: { not: 'PRIVATE' } }
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true
                },
            },
            tracks: true
        }
    }) as ReleasePageData | null;

    if (!release) {
        throw error(404, 'Release not found');
    }

    return {
        release,
        ...definePageMetaTags({
            title: `Groovy | ${release.name} by ${release.user.name}`,
            description: release.description ?? undefined,
            openGraph: {
                title: `${release.name} by ${release.user.name}`,
                description: release.description ?? undefined,
                siteName: 'Groovy',
                profile: {
                    firstName: release.user.name,
                    username: release.user.username ?? undefined
                },
                images: release.cover ? [
                    {
                        url: Appwrite.storage.getFilePreview({
                            bucketId: 'image',
                            fileId: release.cover,
                            height: 600,
                            width: 600,
                            gravity: ImageGravity.Center,
                            output: ImageFormat.Jpeg
                        }),
                        alt: `${release.name} cover image`,
                        width: 600,
                        height: 600,
                        type: 'image/jpeg'
                    }
                ] : undefined
            }
        })
    };
}
