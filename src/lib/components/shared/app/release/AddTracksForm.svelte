<script lang="ts">
    import type { newTrackSchema, uploadTracksSchema } from '$lib/schema/track';
    import { extractFileMetadata } from '$lib/helpers/metadata';
    import { getSupportedMimeTypes } from 'music-metadata';
    import type { SuperForm } from 'sveltekit-superforms';
    import type { Snippet } from 'svelte';
    import type z from 'zod';
    import { resolve } from '$app/paths';

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

    const { form: formData, enhance, submitting } = form;
    const mimeTypes = getSupportedMimeTypes();

    async function analyzeFiles(files: FileList) {
        const tracks: z.infer<typeof newTrackSchema>[] = [];

        for (const file of files) {
            if (!mimeTypes.includes(file.type)) {
                continue;
            }

            const metadata = await extractFileMetadata(file);
            const cover: File|null = metadata.cover
                ? new File(
                    [
                        metadata.cover.data instanceof Uint8Array
                            ? metadata.cover.data.buffer instanceof ArrayBuffer
                                ? new Uint8Array(metadata.cover.data).buffer
                                : metadata.cover.data
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            : metadata.cover.data as any
                    ],
                    `cover.${metadata.cover.format.split('/')[1]?.toLowerCase() || 'jpg'}`,
                    { type: metadata.cover.format }
                )
                : null;

            tracks.push({
                name: metadata.common.title || file.name,
                cover,
                file,
                explicit: false,
                duration: metadata.format.duration ? Math.round(metadata.format.duration) : 0,
                metadata
            });
        }

        $formData.tracks = tracks.filter(t => !!t);

        if ($formData.tracks.length > 0) {
            form.submit();
        }
    }
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
        accept={mimeTypes.join(',')}
        bind:this={input}
        disabled={disabled || $submitting}
        onchange={e => e.currentTarget.files ? analyzeFiles(e.currentTarget.files) : null}
    />
</form>

{@render children?.({
    input,
    disabled: disabled || $submitting,
    submitting: $submitting
})}
