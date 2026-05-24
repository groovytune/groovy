import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma.js';
import { definePageMetaTags } from 'svelte-meta-tags';
import { Appwrite } from '$lib/client/appwrite.js';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { deletePostSchema } from '../../../../lib/schema/post.js';

export async function load({ params }) {

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

export const actions = {
    delete: async ({ request, locals, params }) => {
        if (!locals.user) {
            return fail(401, { message: 'Unauthorized' });
        }

        const form = await superValidate(request, zod4(deletePostSchema));

        if (!form.valid) {
            return fail(400, { form, message: 'Please correct the errors in the form' });
        }

        const post = await prisma.post.delete({
            where: {
                id: params.postId,
                userId: locals.user.id
            }
        });

        return message(form, {
            message: `Post has been deleted successfully.`,
            postId: post.id,
            post,
        });
    }
};
