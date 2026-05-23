import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export async function GET({ params }) {
    const likes = await prisma.postLike.count({
        where: {
            postId: params.postId
        }
    });

    return json({ count: likes });
}
