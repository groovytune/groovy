import { redirect } from '@sveltejs/kit';
import { type PartialUser } from '$lib/helpers/utils';
import { prisma } from '$lib/server/prisma';
import { resolve } from '$app/paths';
import { definePageMetaTags } from 'svelte-meta-tags';
import { Appwrite } from '$lib/client/appwrite';
import { ImageGravity } from 'appwrite';
import { ImageFormat } from 'appwrite';
import type { Lyrics, Release, Track } from '$lib/server/prisma/browser.js';

export type TrackPageData = Track & {
    release: Release & {
        user: PartialUser;
    };
    lyrics: Lyrics|null;
};

export async function load({ params, locals, url }) {
    const track = await prisma.track.findUnique({
        where: {
            id: params.trackId,
            release: {
                id: params.releaseId,
                AND: locals.user
                    ? {
                        OR: [
                            { userId: locals.user.id },
                            { privacy: { not: 'PRIVATE' } }
                        ]
                    }
                    : { privacy: { not: 'PRIVATE' } }
            }
        },
        include: {
            release: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    }
                }
            },
            lyrics: true
        }
    }) as TrackPageData|null;

    if (!track) {
        throw redirect(302, resolve('/(app)/release/[releaseId]', { releaseId: params.releaseId }));
    }

    const title = `Groovy | ${track.name} by ${track.release.user.name}`;
    const description = `Listen to ${track.name} by ${track.release.user.name} on Groovy.`;

    const coverImage = track.cover || track.release.cover
        ? Appwrite.storage.getFilePreview({
            bucketId: 'image',
            fileId: track.cover || track.release.cover!,
            height: 600,
            width: 600,
            gravity: ImageGravity.Center,
            output: ImageFormat.Jpeg
        })
        : undefined;

    return {
        track,
        ...definePageMetaTags({
            title,
            description,
            openGraph: {
                title: `${track.name} by ${track.release.user.name}`,
                description: `Listen to ${track.name} by ${track.release.user.name} on Groovy.`,
                url: new URL(url.pathname, url.origin).href,
                siteName: 'Groovy',
                profile: {
                    firstName: track.release.user.name,
                    username: track.release.user.username ?? undefined
                },
                images: coverImage ? [
                    {
                        url: coverImage,
                        alt: `${track.name} cover image`,
                        width: 600,
                        height: 600,
                        type: 'image/jpeg'
                    }
                ] : undefined
            },
            twitter: {
                cardType: 'summary_large_image',
                title: `${track.name} by ${track.release.user.name}`,
                description: `Listen to ${track.name} by ${track.release.user.name} on Groovy.`,
                image: coverImage,
                imageAlt: `${track.name} cover image`
            }
        })
    };
}
