import { prisma } from '$lib/server/prisma.js';
import { error } from '@sveltejs/kit';
import { definePageMetaTags } from 'svelte-meta-tags';

export async function load({ params }) {
    const { userResolvable } = params;

    const user = await prisma.user.findUnique({
        where: userResolvable.startsWith('@')
            ? { username: userResolvable.slice(1) }
            : { id: userResolvable },
        select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
            favoriteTrack: true,
            genres: {
                select: {
                    id: true,
                    name: true
                }
            },
            _count: {
                select: {
                    followers: true,
                    following: true,
                    releases: true,
                }
            }
        }
    });

    if (!user) {
        throw error(404, 'Artist not found');
    }

    const title = `${user.name} on Groovy`;
    const description = user.bio || `Listen to ${user.name}'s music on Groovy.`;

    return {
        user,
        ...definePageMetaTags({
            title,
            description,
            openGraph: {
                title,
                description,
                image: user.image
                    ? {
                        url: user.image,
                        alt: `${user.name}'s profile picture`
                    }
                    : undefined
            }
        })
    };
}
