<script lang="ts">
    import { filesProxy, type SuperForm } from 'sveltekit-superforms';
    import type z from 'zod';
    import type { newPostSchema } from '$lib/schema/post';
    import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '../../../../ui/input-group';
    import { FormControl, FormField, FormFieldErrors } from '../../../../ui/form';
    import { FilesIcon, ImagesIcon } from '@lucide/svelte';
    import { TextareaAutosize } from 'runed';

    let {
        form
    }: {
        form: SuperForm<z.infer<typeof newPostSchema>>;
    } = $props();

    const { form: formData, submitting } = form;
    const files = filesProxy(form, 'media', { empty: 'undefined' });

    let textarea: HTMLTextAreaElement|null = $state(null);
    let filesInput: HTMLInputElement|null = $state(null);

    new TextareaAutosize({
        element: () => textarea!,
        input: () => $formData.content,
        maxHeight: 500,
    });
</script>

<FormField {form} name="content">
    <FormControl>
        {#snippet children({ props })}
            <InputGroup>
                <InputGroupTextarea
                    {...props}
                    bind:value={$formData.content}
                    bind:ref={textarea}
                    disabled={$submitting}
                    placeholder="What's on your mind?"
                    class="max-h-96"
                />
                <InputGroupAddon align="block-end">
                    <InputGroupButton size="sm" variant="outline" disabled={$submitting} onclick={() => filesInput?.click()}>
                        <ImagesIcon/>
                        <span>{$files.length ? `${$files.length} File${$files.length !== 1 ? 's' : ''}` : 'Files'}</span>
                    </InputGroupButton>
                    <InputGroupButton size="sm" variant="default" class="ml-auto" disabled={$submitting} onclick={() => form.submit()}>
                        <FilesIcon/>
                        <span>Post</span>
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        {/snippet}
    </FormControl>
    <FormFieldErrors/>
</FormField>
<FormField {form} name="media">
    <FormControl>
        {#snippet children({ props })}
            <input
                {...props}
                type="file"
                multiple
                bind:files={$files}
                bind:this={filesInput}
                disabled={$submitting}
                class="sr-only"
            />
        {/snippet}
    </FormControl>
    <FormFieldErrors/>
</FormField>
