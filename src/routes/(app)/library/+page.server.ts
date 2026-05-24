import { redirect } from '@sveltejs/kit';
import { createAuthRedirect } from '../../../lib/helpers/utils.js';

export async function load({ locals, url }) {
    if (!locals.user) {
        throw redirect(302, createAuthRedirect('signin', url));
    }

    return {};
}
