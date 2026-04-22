<script lang="ts">
    import { resolve } from '$app/paths';
    import type { Snippet } from 'svelte';
    import { superForm, type SuperForm, type SuperValidated } from 'sveltekit-superforms';
    import type z from 'zod';
    import { deleteTracksSchema } from '$lib/schema/track';
    import { zod4Client } from 'sveltekit-superforms/adapters';
    import { toast } from 'svelte-sonner';

    let {
        releaseId,
        trackIds = [],
        data,
        form = $bindable(null),
        children,
        onerror,
        ondelete
    }: {
        releaseId: string;
        trackIds?: string[];
        data?: SuperValidated<z.infer<typeof deleteTracksSchema>, unknown>;
        form?: SuperForm<z.infer<typeof deleteTracksSchema>, unknown>|null;
        children?: Snippet<[{ form: SuperForm<z.infer<typeof deleteTracksSchema>, unknown>; submitting: boolean; deleted: boolean; }]>;
        onerror?: (message: string) => void;
        ondelete?: (trackIds: string[]) => void;
    } = $props();

    // svelte-ignore state_referenced_locally
    form = superForm(data ?? { trackIds }, {
        validators: zod4Client(deleteTracksSchema),
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
                toast.error(event.result.data?.message ?? 'Failed to delete tracks.');
                onerror?.(event.result.data?.message ?? 'Failed to delete tracks.');
                return;
            }

            if (type != 'success') return;

            const message = event.result.data?.form.message;

            deleted = true;

            toast.success(message.message);
            ondelete?.(event.result.data?.trackIds ?? []);
        }
    });

    const { enhance, submitting } = form;

    let deleted = $state(false);
</script>

<form
    class="hidden"
    action={resolve('/(app)/release/[id]/tracks', { id: releaseId }) + '?/delete'}
    method="POST"
    use:enhance
></form>

{@render children?.({
    form,
    submitting: $submitting,
    deleted
})}
