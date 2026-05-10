import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';

export async function GET({ params, url }) {
    const {  artistId } = params;

    const take = Number(url.searchParams.get('take'));
    const after = url.searchParams.get('after');
    const order = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    const releases = await prisma.release.findMany({
        where: {
            userId: artistId,
            privacy: 'PUBLIC'
        },
        take: (isNaN(take) || take <= 0 || take > 100)
            ? 20
            : take,
        skip: after ? 1 : 0,
        cursor: after ? { id: after } : undefined,
        orderBy: { id: order }
    });

    return json(releases);
}
