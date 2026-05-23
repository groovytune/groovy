<script lang="ts">
    import { filesProxy, type SuperForm } from 'sveltekit-superforms';
    import type z from 'zod';
    import type { newPostSchema } from '$lib/schema/post';
    import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '$lib/components/ui/input-group';
    import { FormControl, FormField } from '$lib/components/ui/form';
    import { FilesIcon, ImagesIcon, XIcon } from '@lucide/svelte';
    import PostMediaGrid from '../PostMediaGrid.svelte';
    import { onMount } from 'svelte';
    import { useDebounce } from 'runed';
    import type { ClassValue } from 'clsx';
    import { cn } from '$lib/helpers/utils';

    let {
        form,
        textarea = $bindable(null),
        filesInput = $bindable(null),
        disableMedia = false,
        class: className = '',
        errorClass = '',
        mediaClass = ''
    }: {
        form: SuperForm<z.infer<typeof newPostSchema>>;
        textarea?: HTMLTextAreaElement|null;
        filesInput?: HTMLInputElement|null;
        disableMedia?: boolean;
        class?: ClassValue;
        errorClass?: ClassValue;
        mediaClass?: ClassValue;
    } = $props();

    const { form: formData, submitting, allErrors } = form;
    const files = filesProxy(form, 'media', { empty: 'undefined' });

    let mediaPreview: { type: 'image'|'video'; url: string; }[] = $state([]);

    function updateMediaPreview(files?: FileList) {
        for (const media of mediaPreview) {
            URL.revokeObjectURL(media.url);
        }

        mediaPreview = [];

        if (!files?.length) return;

        for (const file of files) {
            const data = {
                type: file.type.startsWith('video') ? 'video' : 'image',
                url: URL.createObjectURL(file)
            } as const;

            mediaPreview.push(data);
        }
    }

    const updateMediaPreviewDebounced = useDebounce(updateMediaPreview, 500);

    onMount(() => files.subscribe(updateMediaPreviewDebounced));
</script>

<FormField {form} name="content" class="p-0">
    <FormControl>
        {#snippet children({ props })}
            <InputGroup class={cn(className)}>
                <InputGroupTextarea
                    {...props}
                    bind:value={$formData.content}
                    bind:ref={textarea}
                    disabled={$submitting}
                    placeholder="What's on your mind?"
                    class="max-h-96 min-h-20"
                />
                <InputGroupAddon align="block-end">
                    <InputGroupButton
                        size="icon-sm"
                        class={[
                            "rounded-lg hidden",
                            $files.length && "inline-flex"
                        ]}
                        variant="outline"
                        disabled={$submitting}
                        onclick={() => files.set([])}
                    >
                        <XIcon/>
                    </InputGroupButton>
                    <InputGroupButton
                        size="sm"
                        variant="outline"
                        disabled={$submitting}
                        onclick={() => filesInput?.click()}
                        class={[disableMedia && "hidden"]}
                    >
                        <ImagesIcon/>
                        <span>{$files.length ? `${$files.length} File${$files.length !== 1 ? 's' : ''}` : 'Attach Files'}</span>
                    </InputGroupButton>
                    <InputGroupButton
                        size="sm"
                        variant="default"
                        class="ml-auto"
                        disabled={$submitting}
                        onclick={() => form.submit()}
                    >
                        <FilesIcon/>
                        <span>Post</span>
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        {/snippet}
    </FormControl>
</FormField>
<FormField {form} name="media" class="hidden">
    <FormControl>
        {#snippet children({ props })}
            <input
                {...props}
                type="file"
                multiple
                bind:files={$files}
                bind:this={filesInput}
                disabled={$submitting}
                accept="image/jpeg,image/png,image/gif,video/mp4,video/webm"
            />
        {/snippet}
    </FormControl>
</FormField>
{#if $allErrors.length}
    <div class={cn("text-sm text-destructive", errorClass)}>
        {#each $allErrors as error (error.path)}
            <p>
                {error.messages}
            </p>
        {/each}
    </div>
{/if}
<PostMediaGrid
    media={mediaPreview}
    preview={true}
    disabled={$submitting}
    class={cn(mediaClass)}
    onremove={index => {
        const updatedFiles = [...$files];

        URL.revokeObjectURL(mediaPreview[index].url);
        updatedFiles.splice(index, 1);
        files.set(updatedFiles);
    }}
/>
