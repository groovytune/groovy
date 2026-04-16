<script lang="ts">
    import type { uploadTracksSchema } from '$lib/schema/track';
    import { filesProxy, type SuperForm } from 'sveltekit-superforms';
    import { tick, type Snippet } from 'svelte';
    import type z from 'zod';
    import { resolve } from '$app/paths';
    import { supportedAudioMimeTypes } from '$lib/helpers/constants';

    let {
        releaseId,
        form,
        input = $bindable(null),
        disabled = false,
        children
    }: {
        releaseId: string;
        form: SuperForm<z.infer<typeof uploadTracksSchema>, unknown>;
        input?: HTMLInputElement|null;
        disabled?: boolean;
        children?: Snippet<[{
            input: HTMLInputElement|null;
            disabled: boolean;
            submitting: boolean;
        }]>;
    } = $props();

    // svelte-ignore state_referenced_locally
    const { form: formData, enhance, submitting } = form;

    const formFiles = filesProxy(formData, 'files', {
        empty: 'null'
    });
</script>

<form
    use:enhance
    action={resolve('/(app)/release/[id]', { id: releaseId }) + '?/upload'}
    method="POST"
    enctype="multipart/form-data"
    class="hidden"
>
    <input
        multiple
        type="file"
        accept={supportedAudioMimeTypes.join(',')}
        bind:this={input}
        bind:files={$formFiles}
        disabled={disabled || $submitting}
        onchange={() => tick().then(() => form.submit())}
    />
</form>

{@render children?.({
    input,
    disabled: disabled || $submitting,
    submitting: $submitting
})}
