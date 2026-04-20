<script lang="ts">
    import { uploadTracksSchema } from '$lib/schema/track';
    import { superForm, type SuperForm, type SuperValidated } from 'sveltekit-superforms';
    import { tick, type Snippet } from 'svelte';
    import type z from 'zod';
    import { resolve } from '$app/paths';
    import { supportedAudioMimeTypes } from '$lib/helpers/constants';
    import { zod4Client } from 'sveltekit-superforms/adapters';
    import { toast } from 'svelte-sonner';
    import type { Track } from '$lib/server/prisma/browser';

    let {
        releaseId,
        input = $bindable(null),
        disabled = false,
        data,
        form = $bindable(null),
        onupload,
        children
    }: {
        releaseId: string;
        input?: HTMLInputElement|null;
        disabled?: boolean;
        data?: SuperValidated<z.infer<typeof uploadTracksSchema>, unknown>;
        form?: SuperForm<z.infer<typeof uploadTracksSchema>, unknown>|null;
        onupload?: (tracks: Track[]) => void;
        children?: Snippet<[{
            input: HTMLInputElement|null;
            disabled: boolean;
            submitting: boolean;
        }]>;
    } = $props();

    // svelte-ignore state_referenced_locally
    form = superForm(data ?? { files: null }, {
        validators: zod4Client(uploadTracksSchema),
        validationMethod: 'onsubmit',
        invalidateAll: false,
        resetForm: false,
        dataType: 'json',
        onError: event => {
            console.error('Form submission error:', event.result);
            toast.error(event.result.error.message);
        },
        onResult: event => {
            const { type } = event.result;

            if (type === 'failure') {
                const errors: string|undefined = event.result.data?.form.errors?.files?.join('\n');

                toast.error(errors ?? event.result.data?.message ?? 'Failed to upload tracks.');
                return;
            }

            if (type != 'success') return;

            const message = event.result.data?.form.message;

            if (message.invalid?.length) {
                const invalidFiles = message.invalid.map((i: { file: File }) => i.file.name).join(', ');
                toast.error(`Some files were invalid: ${invalidFiles}`);
            }


            const newTracks = (message.tracks ?? []) as Track[];
            const invalid = message.invalid as { file: File; reason: string }[];

            toast.success(message.message ?? `Uploaded ${newTracks.length} track${newTracks.length > 1 ? 's' : ''}.`);

            if (invalid?.length) {
                const invalidFiles = invalid.map(i => i.file.name).join(', ');
                toast.error(`Some files were invalid: ${invalidFiles}`);
            }

            onupload?.(newTracks);
        }
    });

    const { form: formData, enhance, submitting } = form;
</script>

<form
    use:enhance
    action={resolve('/(app)/release/[id]/tracks', { id: releaseId }) + '?/upload'}
    method="POST"
    enctype="multipart/form-data"
    class="hidden"
>
    <input
        multiple
        type="file"
        accept={supportedAudioMimeTypes.join(',')}
        bind:this={input}
        disabled={disabled || $submitting}
        onchange={async event => {
            const files = event.currentTarget.files;

            $formData.files = files ? Array.from(files) : null;

            if ($formData.files?.length) {
                await tick();
                form.submit();
            }
        }}
    />
</form>

{@render children?.({
    input,
    disabled: disabled || $submitting,
    submitting: $submitting
})}
