import { resolve } from '$app/paths';
import { error } from '@sveltejs/kit';
import type { GETResponse } from '../../api/discover/chart/streams/tracks/+server.js';
import { prisma } from '$lib/server/prisma.js';
import { definePageMetaTags } from 'svelte-meta-tags';
import { Image } from '$lib/client/image.js';
import path from 'node:path';
import { ImageGravity } from 'node-appwrite';
import { ImageFormat } from 'node-appwrite';

export async function load({ fetch, url }) {
    const genreQuery = url.searchParams.get('genre');
    const genre = genreQuery
        ? await prisma.genre.findFirst({
            where: {
                OR: [
                    { id: genreQuery },
                    {
                        name: {
                            equals: genreQuery,
                            mode: 'insensitive'
                        } 
                    }
                ]
            },
            select: {
                id: true,
                name: true
            }
        })
        : null;

    const res = await fetch(resolve('/(app)/api/discover/chart/streams/tracks') + (genre ? `?genre=${genre.id}` : ''));
    if (!res.ok) throw error(res.status, 'Failed to fetch chart tracks');

    const tracks: GETResponse = await res.json();
    const title = genre ? `Groovy ${genre.name} Chart` : 'Groovy Global Chart';
    const description = `Discover the top tracks in the ${genre ? genre.name : 'global'} chart on Groovy. Explore the most streamed songs from various genres and find your next favorite track!`;
    const coverImage = tracks[0]?.cover
        ? new URL(
            path.resolve(
                '/',
                Image.getPreviewPath({
                    fileId: tracks[0].cover,
                    height: 600,
                    width: 600,
                    gravity: ImageGravity.Center,
                    output: ImageFormat.Jpeg
                })
            ),
            url.origin
        )
        : undefined;

    return {
        genre,
        tracks,
        ...definePageMetaTags({
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'website',
                image: coverImage
                    ? {
                        url: coverImage.toString(),
                        alt: `${tracks[0].name} cover image`,
                        width: 600,
                        height: 600
                    }
                    : undefined
            }
        })
    };
}
