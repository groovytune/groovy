<script lang="ts">
    import { resolve } from '$app/paths';
    import type { Snippet } from 'svelte';
    import { superForm, type SuperForm, type SuperValidated } from 'sveltekit-superforms';
    import type z from 'zod';
    import { zod4Client } from 'sveltekit-superforms/adapters';
    import { toast } from 'svelte-sonner';
    import type { Post } from '$lib/server/prisma/browser';
    import { deletePostSchema } from '$lib/schema/post';

    let {
        postId,
        data,
        // eslint-disable-next-line no-useless-assignment
        form = $bindable(null),
        children,
        onerror,
        ondelete
    }: {
        postId: string;
        data?: SuperValidated<z.infer<typeof deletePostSchema>>;
        form?: SuperForm<z.infer<typeof deletePostSchema>>|null;
        children?: Snippet<[{ form: SuperForm<z.infer<typeof deletePostSchema>>; submitting: boolean; deleted: boolean; }]>;
        onerror?: (message: string) => void;
        ondelete?: (release: Post) => void;
    } = $props();

    // svelte-ignore state_referenced_locally
    form = superForm(data ?? {}, {
        id: `delete-post-${postId}`,
        validators: zod4Client(deletePostSchema),
        validationMethod: 'onsubmit',
        invalidateAll: false,
        resetForm: false,
        dataType: 'json',
        onError: event => {
            console.error('Form submission error:', event.result);
            toast.error(event.result.error.message);
            onerror?.(event.result.error.message);
        },
        onResult: event => {
            const { type } = event.result;

            if (type === 'failure') {
                console.error('Form submission failed:', event.result);
                toast.error(event.result.data?.message ?? 'Failed to delete post.');
                onerror?.(event.result.data?.message ?? 'Failed to delete post.');
                return;
            }

            if (type != 'success') return;

            const message = event.result.data?.form.message;

            deleted = true;

            toast.success(message.message);
            ondelete?.(message.post);
        }
    });

    const { enhance, submitting } = form;

    let deleted = $state(false);
</script>

<form
    class="hidden"
    action={resolve('/(app)/post/[postId]', { postId }) + '?/delete'}
    method="POST"
    use:enhance
></form>

{@render children?.({
    form,
    submitting: $submitting,
    deleted
})}
