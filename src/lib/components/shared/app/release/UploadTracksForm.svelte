<script lang="ts">
    import type { newTrackSchema, uploadTracksSchema } from '$lib/schema/track';
    import { extractFileMetadata } from '$lib/helpers/metadata';
    import type { SuperForm } from 'sveltekit-superforms';
    import type { Snippet } from 'svelte';
    import type z from 'zod';
    import { resolve } from '$app/paths';
    import { supportedAudioMimeTypes } from '$lib/helpers/constants';
    import { toast } from 'svelte-sonner';

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
            analyzing: boolean;
        }]>;
    } = $props();

    let analyzing = $state(false);

    // svelte-ignore state_referenced_locally
    const { form: formData, enhance, submitting, allErrors } = form;

    async function analyzeFiles(files: FileList) {
        analyzing = true;

        const tracks: (z.infer<typeof newTrackSchema>|null)[] = await Promise.all(
            Array
                .from(files)
                .map(async file => {
                    if (!supportedAudioMimeTypes.includes(file.type)) {
                        return null;
                    }

                    console.log(`Analyzing file: ${file.name}`);

                    const metadata = await extractFileMetadata(file, true)
                        .catch(err => {
                            console.error(`Error extracting metadata for file ${file.name}:`, err);
                            toast.error(`Failed to extract metadata for file: ${file.name}`);
                            return null;
                        });

                    if (!metadata) {
                        return null;
                    }

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

                    console.log(`Extracted metadata for file ${file.name}:`, {
                        title: metadata.common.title,
                        duration: metadata.duration,
                        cover: !!cover
                    });

                    return {
                        name: metadata.common.title || file.name,
                        cover,
                        file,
                        explicit: false,
                        duration: metadata.duration,
                        metadata
                    };
                })
        );

        $formData.tracks = tracks.filter(t => !!t);
        analyzing = false;

        if (!$formData.tracks.length) {
            return;
        }

        if ($allErrors.length) {
            console.error('Validation errors:', $allErrors);
            toast.error('Some files have invalid metadata. Please review and correct the errors before submitting.');
            return;
        }

        console.log('Submitting form with tracks:', $formData.tracks);

        form.submit();
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
        accept={supportedAudioMimeTypes.join(',')}
        bind:this={input}
        disabled={disabled || $submitting || analyzing}
        onchange={e => e.currentTarget.files?.length ? analyzeFiles(e.currentTarget.files) : null}
    />
</form>

{@render children?.({
    input,
    disabled: disabled || $submitting || analyzing,
    submitting: $submitting,
    analyzing
})}
