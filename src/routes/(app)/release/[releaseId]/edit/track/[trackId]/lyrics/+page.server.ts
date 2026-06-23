import { redirect } from '@sveltejs/kit';
import { createAuthRedirect } from '$lib/helpers/utils';
import { prisma } from '$lib/server/prisma';
import { resolve } from '$app/paths';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { newLyricsSchema } from '$lib/schema/lyrics.js';
import { zod4 } from 'sveltekit-superforms/adapters';
import { Lyrics } from '../../../../../../../../lib/server/lyrics.js';

export async function load({ params, locals, url }) {
    if (!locals.session) {
        throw redirect(302, createAuthRedirect('signin', url));
    }

    const track = await prisma.track.findUnique({
        where: {
            id: params.trackId,
            release: {
                id: params.releaseId,
                userId: locals.session.user.id
            }
        },
        include: {
            lyrics: true,
            release: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    if (!track) {
        throw redirect(302, resolve('/(app)/release/[releaseId]/edit/tracks', { releaseId: params.releaseId }));
    }

    const form = await superValidate({
        format: (track.lyrics?.format || 'LRC'),
        content: track.lyrics?.content || ''
    }, zod4(newLyricsSchema));

    return {
        track,
        form
    };
}

export const actions = {
    edit: async ({ request, params, locals, url }) => {
        if (!locals.session) {
            throw redirect(302, createAuthRedirect('signin', url));
        }

        const form = await superValidate(request, zod4(newLyricsSchema));

        if (!form.valid) {
            return fail(400, { form, message: 'Please correct the errors.' });
        }

        if (!Lyrics.isValidLyrics(form.data)) {
            return fail(400, { form, message: 'Failed to parse lyrics content. Please check the format and content.' });
        }

        await prisma.lyrics.upsert({
            where: {
                trackId: params.trackId,
                track: {
                    release: {
                        id: params.releaseId,
                        userId: locals.session.user.id
                    }
                }
            },
            create: {
                trackId: params.trackId,
                format: form.data.format,
                content: form.data.content,
            },
            update: {
                format: form.data.format,
                content: form.data.content,
            }
        });

        return message(form, { message: 'Lyrics updated successfully!' });
    }
};
