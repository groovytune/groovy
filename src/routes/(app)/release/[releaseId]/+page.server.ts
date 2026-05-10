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

export async function load({ params, locals, url }) {
    const { releaseId } = params;

    const release = await prisma.release.findUnique({
        where: {
            id: releaseId,
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

    const coverImage = release.cover
        ? Appwrite.storage.getFilePreview({
            bucketId: 'image',
            fileId: release.cover,
            height: 600,
            width: 600,
            gravity: ImageGravity.Center,
            output: ImageFormat.Jpeg
        })
        : undefined;

    return {
        release,
        ...definePageMetaTags({
            title: `Groovy | ${release.name} by ${release.user.name}`,
            description: release.description ?? undefined,
            openGraph: {
                title: `${release.name} by ${release.user.name}`,
                description: release.description ?? undefined,
                url: new URL(url.pathname, url.origin).href,
                siteName: 'Groovy',
                profile: {
                    firstName: release.user.name,
                    username: release.user.username ?? undefined
                },
                images: coverImage ? [
                    {
                        url: coverImage,
                        alt: `${release.name} cover image`,
                        width: 600,
                        height: 600,
                        type: 'image/jpeg'
                    }
                ] : undefined
            },
            twitter: {
                cardType: 'summary_large_image',
                title: `${release.name} by ${release.user.name}`,
                description: release.description ?? undefined,
                image: coverImage,
                imageAlt: `${release.name} cover image`
            }
        })
    };
}
