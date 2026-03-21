import { error, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export async function load({ params, locals }) {
    const { id } = params;

    if (!locals.user) {
        throw redirect(302, '/login');
    }

    const release = await prisma.release.findUnique({
        where: {
            id,
            userId: locals.user.id
        },
        include: {
            tracks: true
        }
    });

    if (!release) {
        throw error(404, 'Release not found');
    }

    return { release };
}
