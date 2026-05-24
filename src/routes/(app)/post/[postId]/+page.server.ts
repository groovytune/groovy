import { error, redirect } from '@sveltejs/kit';
import { createAuthRedirect } from '$lib/helpers/utils';
import { prisma } from '$lib/server/prisma.js';
import { definePageMetaTags } from 'svelte-meta-tags';
import { Appwrite } from '../../../../lib/client/appwrite.js';

export async function load({ locals, url, params }) {
    if (!locals.session?.user) {
        throw redirect(302, createAuthRedirect('signin', url));
    }

    const post = await prisma.post.findUnique({
        where: {
            id: params.postId
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true
                }
            },
            reference: {
                select: {
                    id: true,
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
            _count: {
                select: {
                    likes: true,
                    replies: true
                }
            }
        }
    });

    if (!post) {
        throw error(404, 'Post not found');
    }

    const title = `${post.user.name} on Groovy`;
    const description = post.content.length > 160 ? post.content.slice(0, 157) + '...' : post.content;
    const mediaId = post.media ? post.media[0] : null;

    const mediaFile = mediaId
        ? await Appwrite.storage.getFile({ bucketId: 'media', fileId: mediaId })
        : null;

    const mediaURL = mediaId
        ? Appwrite.storage.getFileView({ bucketId: 'media', fileId: mediaId })
        : null;

    return {
        post,
        ...definePageMetaTags({
            title,
            description,
            openGraph: {
                title,
                description,
                images: mediaFile?.mimeType.startsWith('image/') && mediaURL
                    ? [
                        {
                            url: mediaURL,
                            width: 1200,
                            height: 630
                        }
                    ]
                    : undefined,
                type: 'article'
            }
        })
    };
}
