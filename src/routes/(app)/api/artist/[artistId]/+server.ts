import { error, json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export async function GET({ params }) {
    const { artistId } = params;

    const artist = await prisma.user.findUnique({
        where: { id: artistId },
        select: {
            id: true,
            name: true,
            image: true,
        },
    });

    if (!artist) {
        throw error(404, 'Artist not found');
    }

    return json(artist);
}
