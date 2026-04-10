<script lang="ts">
    import { fileProxy, superForm } from 'sveltekit-superforms';
    import { zod4 } from 'sveltekit-superforms/adapters';
    import { newReleaseSchema } from '$lib/schema/release.js';
    import { FormControl, FormField, FormFieldErrors, FormLabel } from '$lib/components/ui/form/index.js';
    import { Input } from '$lib/components/ui/input/index.js';
    import { Textarea } from '$lib/components/ui/textarea/index.js';
    import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select/index.js';
    import { Button } from '$lib/components/ui/button/index.js';
    import FileInput from '$lib/components/shared/FileInput.svelte';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio/index.js';
    import { auth } from '$lib/client/auth.js';
    import ExplicitIcon from '$lib/components/shared/ExplicitIcon.svelte';

    let { data } = $props();

    const form = superForm(data.form, {
        validators: zod4(newReleaseSchema),
        clearOnSubmit: 'errors-and-message',
        autoFocusOnError: true,
        validationMethod: 'auto'
    });

    const { form: formData, enhance, submitting, allErrors } = form;

    const cover = fileProxy(form, 'cover', {
        empty: 'undefined'
    });

    const session = auth.useSession();
</script>

<div class="flex justify-center">
    <div class="p-5 w-full max-w-sm relative">
        {#key $formData.cover}
            {@const url = $formData.cover ? URL.createObjectURL($formData.cover) : null}
            <AspectRatio class="w-full rounded-md bg-muted">
                <img src={url} alt=" " class="size-full object-cover rounded-md"/>
                <img src={url} alt=" " class="size-full object-cover absolute -z-10 top-0 left-0 opacity-50 saturate-150 blur-3xl"/>
            </AspectRatio>
        {/key}
    </div>
</div>
<div class="flex flex-col items-center text-center px-5">
    <h1 class="text-2xl leading-tight font-semibold line-clamp-3 whitespace-break-spaces max-w-sm" style="word-wrap: break-word;">
        {$formData.name || 'New Release'}
        {#if $formData.explicit}
            <ExplicitIcon/>
        {/if}
    </h1>
    <p class="text-sm leading-tight text-muted-foreground">
        {$session.data?.user.name}
    </p>
    <p class="text-xs leading-tight text-muted-foreground/60 line-clamp-2 mt-2 mb-5 text-center max-w-sm">
        {$formData.description || ''}
    </p>
</div>
<form method="POST" enctype="multipart/form-data" use:enhance class="p-5">
    <FormField {form} name="type">
        <FormControl>
            {#snippet children({ props })}
                <FormLabel>Type</FormLabel>
                <Select {...props} type="single" bind:value={$formData.type}>
                    <SelectTrigger class={$formData.type !== 'EP' ? 'capitalize' : 'uppercase'}>
                        {$formData.type.toLowerCase() || 'Select a release type'}
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALBUM">Album</SelectItem>
                        <SelectItem value="SINGLE">Single</SelectItem>
                        <SelectItem value="EP">EP</SelectItem>
                    </SelectContent>
                </Select>
            {/snippet}
        </FormControl>
        <FormFieldErrors/>
    </FormField>
    <FormField {form} name="name">
        <FormControl>
            {#snippet children({ props })}
                <FormLabel>Name</FormLabel>
                <Input {...props} bind:value={$formData.name} placeholder="Release Name"/>
            {/snippet}
        </FormControl>
        <FormFieldErrors/>
    </FormField>
    <FormField {form} name="description">
        <FormControl>
            {#snippet children({ props })}
                <FormLabel>Description</FormLabel>
                <Textarea {...props} bind:value={$formData.description} placeholder="Release Description"/>
            {/snippet}
        </FormControl>
        <FormFieldErrors/>
    </FormField>
    <FormField {form} name="privacy">
        <FormControl>
            {#snippet children({ props })}
                <FormLabel>Privacy</FormLabel>
                <Select {...props} type="single" bind:value={$formData.privacy}>
                    <SelectTrigger class="capitalize">
                        {$formData.privacy.toLowerCase() || 'Select a privacy level'}
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PUBLIC">Public</SelectItem>
                        <SelectItem value="PRIVATE">Private</SelectItem>
                        <SelectItem value="UNLISTED">Unlisted</SelectItem>
                    </SelectContent>
                </Select>
            {/snippet}
        </FormControl>
        <FormFieldErrors/>
    </FormField>
    <FormField {form} name="cover">
        <FormControl>
            {#snippet children({ props })}
                <FormLabel>Cover</FormLabel>
                <FileInput {...props} accept="image/*" bind:files={$cover}/>
            {/snippet}
        </FormControl>
        <FormFieldErrors/>
    </FormField>
    <div>
        <Button type="submit" disabled={$submitting || !!$allErrors.length}>
            Submit
        </Button>
    </div>
</form>
