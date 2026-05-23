import { fail, redirect } from '@sveltejs/kit';
import { createAuthRedirect } from '$lib/helpers/utils';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { newPostSchema } from '$lib/schema/post';
import { Appwrite } from '$lib/server/appwrite';
import { prisma } from '../../../lib/server/prisma';

export async function load({ locals, url }) {
    if (!locals.session?.user) {
        throw redirect(302, createAuthRedirect('signin', url));
    }

    return {};
}

export const actions = {
    upload: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { message: 'Unauthorized' });
        }

        const form = await superValidate(request, zod4(newPostSchema), {
            allowFiles: true
        });

        if (!form.valid) {
            return fail(400, { form, message: 'Please correct the errors in the form' });
        }

        const files: string[] = [];

        for (const file of form.data.media ?? []) {
            files.push((await Appwrite.uploadFile(file, 'media')).$id);
        }

        const post = await prisma.$transaction(async (tx) => {
            const reference = form.data.referenceId
                ? await tx.post.findUnique({
                    where: {
                        id: form.data.referenceId
                    },
                    select: {
                        id: true,
                        userId: true
                    }
                })
                : null;

            return await prisma.post.create({
                data: {
                    referenceId: reference?.id,
                    content: form.data.content,
                    media: files,
                    userId: locals.user!.id
                }
            });
        });

        return message(form, { message: 'Post created successfully!', post });
    }
};
