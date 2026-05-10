<script lang="ts">
    import { resolve } from '$app/paths';
    import type { Snippet } from 'svelte';
    import { superForm, type SuperForm, type SuperValidated } from 'sveltekit-superforms';
    import type z from 'zod';
    import { zod4Client } from 'sveltekit-superforms/adapters';
    import { toast } from 'svelte-sonner';
    import { deleteReleaseSchema } from '$lib/schema/release';
    import type { Release } from '$lib/server/prisma/browser';

    let {
        releaseId,
        data,
        // eslint-disable-next-line no-useless-assignment
        form = $bindable(null),
        children,
        onerror,
        ondelete
    }: {
        releaseId: string;
        data?: SuperValidated<z.infer<typeof deleteReleaseSchema>>;
        form?: SuperForm<z.infer<typeof deleteReleaseSchema>>|null;
        children?: Snippet<[{ form: SuperForm<z.infer<typeof deleteReleaseSchema>>; submitting: boolean; deleted: boolean; }]>;
        onerror?: (message: string) => void;
        ondelete?: (release: Release & Record<'_count', Record<'tracks', number>>) => void;
    } = $props();

    // svelte-ignore state_referenced_locally
    form = superForm(data ?? {}, {
        id: `delete-releases-${releaseId}`,
        validators: zod4Client(deleteReleaseSchema),
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
                toast.error(event.result.data?.message ?? 'Failed to delete releases.');
                onerror?.(event.result.data?.message ?? 'Failed to delete releases.');
                return;
            }

            if (type != 'success') return;

            const message = event.result.data?.form.message;

            deleted = true;

            toast.success(message.message);
            ondelete?.(message.release);
        }
    });

    const { enhance, submitting } = form;

    let deleted = $state(false);
</script>

<form
    class="hidden"
    action={resolve('/(app)/release/[releaseId]/edit', { releaseId }) + '?/delete'}
    method="POST"
    use:enhance
></form>

{@render children?.({
    form,
    submitting: $submitting,
    deleted
})}
