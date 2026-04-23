<script lang="ts">
    import { fileProxy, superForm } from 'sveltekit-superforms';
    import { zod4Client } from 'sveltekit-superforms/adapters';
    import { editTrackSchema } from '$lib/schema/track.js';
    import { toast } from 'svelte-sonner';
    import { resolve } from '$app/paths';
    import { auth } from '$lib/client/auth.js';
    import { Appwrite } from '$lib/client/appwrite.js';
    import { ImageGravity } from 'appwrite';
    import placeholderCover from '$lib/assets/cover.webp';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio';
    import ExplicitIcon from '$lib/components/shared/ExplicitIcon.svelte';
    import { Button } from '$lib/components/ui/button/index.js';
    import { LoaderIcon } from '@lucide/svelte';
    import { FormControl, FormField, FormFieldErrors, FormLabel } from '$lib/components/ui/form';
    import { Input } from '$lib/components/ui/input';
    import FileInput from '$lib/components/shared/FileInput.svelte';
    import GenreSearchInput from '$lib/components/shared/app/release/GenreSearchInput.svelte';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '$lib/components/ui/item/index.js';
    import { Switch } from '$lib/components/ui/switch/index.js';

    let { data } = $props();

    // svelte-ignore state_referenced_locally
    const form = superForm(data.form, {
        validators: zod4Client(editTrackSchema),
        clearOnSubmit: 'errors-and-message',
        dataType: 'json',
        autoFocusOnError: true,
        validationMethod: 'auto',
        taintedMessage: true,
        invalidateAll: false,
        resetForm: false,
        onError: event => {
            console.error('Form submission error:', event.result);
            toast.error(event.result.error.message);
        },
        onResult: event => {
            const { type } = event.result;

            if (type === 'failure') {
                console.error('Form submission failed:', event.result);
                toast.error(event.result.data?.message ?? 'Failed to edit release.');
                return;
            }

            if (type != 'success') return;

            const message = event.result.data?.form.message;
            toast.success(message.message ?? 'Track edited successfully!');
        }
    });

    const { form: formData, enhance, submitting, allErrors } = form;

    const session = auth.useSession();
    const cover = fileProxy(form, 'cover', { empty: 'undefined' });

    let coverInput: HTMLInputElement|null = $state(null);
    let nameInput: HTMLInputElement|null = $state(null);

    let coverURL = $derived(
        $formData.cover
            ? URL.createObjectURL($formData.cover)
            : data.track.cover
                ? Appwrite.storage.getFilePreview({
                    bucketId: 'image',
                    fileId: data.track.cover,
                    width: 500,
                    height: 500,
                    gravity: ImageGravity.Center
                })
                : placeholderCover
    );
</script>

<div class="flex flex-col md:flex-row">
    <section class="w-full shrink-0 flex flex-col items-center md:max-w-sm">
        <div class="p-5 w-full max-w-sm relative">
            {#key $formData.cover}
                <AspectRatio
                    class="w-full rounded-md bg-muted cursor-pointer"
                    onclick={() => coverInput?.click()}
                >
                    <img src={coverURL} alt="Release Cover" class="size-full object-cover rounded-md"/>
                    <img src={coverURL} alt="Release Cover" class="size-full object-cover absolute -z-10 top-0 left-0 opacity-50 saturate-150 blur-2xl"/>
                </AspectRatio>
            {/key}
        </div>
        <header class="w-full max-w-sm text-center px-5">
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <h1
                class="text-2xl leading-tight font-semibold line-clamp-3"
                style="word-wrap: break-word;"
                onclick={() => nameInput?.focus()}
            >
                {$formData.name || 'Untitled Track'}
                {#if $formData.explicit}
                    <ExplicitIcon/>
                {/if}
            </h1>
            <p class="text-sm leading-tight text-muted-foreground">
                {$session.data?.user.name || 'Unknown Artist'}
            </p>
        </header>
    </section>
    <form
        class="w-full md:max-w-[calc(100%-24rem)] p-5 flex flex-col gap-2"
        action={resolve('/(app)/release/[id]/track/[trackId]', { id: data.track.releaseId, trackId: data.track.id }) + '?/edit'}
        method="POST"
        enctype="multipart/form-data"
        use:enhance
    >
        <FormField {form} name="name">
            <FormControl>
                {#snippet children({ props })}
                    <FormLabel>Name</FormLabel>
                    <Input
                        {...props}
                        bind:value={$formData.name}
                        bind:ref={nameInput}
                        disabled={$submitting}
                        placeholder="Track Name"
                    />
                {/snippet}
            </FormControl>
            <FormFieldErrors/>
        </FormField>
        <FormField {form} name="cover">
            <FormControl>
                {#snippet children({ props })}
                    <FormLabel>Cover Image</FormLabel>
                    <FileInput
                        {...props}
                        bind:files={$cover}
                        bind:ref={coverInput}
                        disabled={$submitting}
                        accept="image/*"
                    />
                {/snippet}
            </FormControl>
            <FormFieldErrors/>
        </FormField>
        <FormField {form} name="explicit">
            <FormControl>
                {#snippet children({ props })}
                    <Item variant="outline">
                        {#snippet child({ props: itemProps })}
                            <FormLabel {...itemProps}>
                                <ItemMedia variant="icon">
                                    <ExplicitIcon class="leading-3.5! mb-0"/>
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>
                                        Mark this release as explicit
                                    </ItemTitle>
                                    <ItemDescription class={$formData.explicit ? "line-clamp-none" : "line-clamp-3"}>
                                        Explicit content may include strong language, sexual content, or violence. Marking your release as explicit helps ensure it is properly labeled and filtered on platforms that support content warnings.
                                    </ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <Switch
                                        {...props}
                                        bind:checked={$formData.explicit}
                                        disabled={$submitting}
                                    />
                                </ItemActions>
                            </FormLabel>
                        {/snippet}
                    </Item>
                {/snippet}
            </FormControl>
            <FormFieldErrors/>
        </FormField>
        <FormField {form} name="genres">
            <FormControl>
                {#snippet children({ props })}
                    <FormLabel class="text-lg">Genres</FormLabel>
                    <GenreSearchInput
                        {...props}
                        bind:value={$formData.genres}
                        disabled={$submitting}
                        placeholder="Search and add genres to your track"
                    />
                {/snippet}
            </FormControl>
            <FormFieldErrors/>
        </FormField>
        <div class="flex justify-end">
            <Button type="submit" disabled={$submitting || !!$allErrors.length}>
                {#if $submitting}
                    <LoaderIcon class="animate-spin"/>
                {/if}
                Submit
            </Button>
        </div>
    </form>
</div>
