<script lang="ts">
    import { fileProxy, superForm } from 'sveltekit-superforms';
    import { zod4Client } from 'sveltekit-superforms/adapters';
    import { Button } from '$lib/components/ui/button';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio';
    import { LoaderIcon } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';
    import { resolve } from '$app/paths';
    import { editUserSchema } from '$lib/schema/user.js';
    import { FormControl, FormField, FormFieldErrors, FormLabel } from '$lib/components/ui/form/index.js';
    import { Input } from '$lib/components/ui/input/index.js';
    import { Textarea } from '$lib/components/ui/textarea/index.js';
    import { InputGroup, InputGroupAddon, InputGroupInput } from '$lib/components/ui/input-group/index.js';
    import InputGroupText from '$lib/components/ui/input-group/input-group-text.svelte';
    import GenreSearchInput from '$lib/components/shared/app/release/GenreSearchInput.svelte';
    import TrackSearchInput from '$lib/components/shared/app/artist/TrackSearchInput.svelte';
    import type { Track } from '$lib/server/prisma/browser.js';

    let { data } = $props();

    // svelte-ignore state_referenced_locally
    const form = superForm(data.form, {
        validators: zod4Client(editUserSchema),
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
            toast.success(message.message ?? 'Release edited successfully!');
        }
    });

    const { form: formData, enhance, submitting, allErrors, capture, restore } = form;

    const imageProxy = fileProxy(form, 'image', { empty: 'undefined' });

    let avatarInput: HTMLInputElement|null = $state(null);
    let nameInput: HTMLInputElement|null = $state(null);

    let avatarURL = $derived(
        $formData.image
            ? URL.createObjectURL($formData.image)
            : data.user.image
    );

    export const snapshot = { capture, restore };
</script>

<div class="flex flex-col items-center">
    <section class="w-full max-w-xl shrink-0 flex items-center">
        <div class="p-5 w-50 relative shrink-0">
            {#key avatarURL}
                <AspectRatio
                    class="w-full rounded-full bg-muted cursor-pointer"
                    onclick={() => avatarInput?.click()}
                >
                    <img src={avatarURL} alt={data.user.name} class="size-full object-cover rounded-full"/>
                    <img src={avatarURL} alt={data.user.name} class="size-full object-cover absolute -z-10 top-0 left-0 opacity-20 saturate-150 blur-2xl"/>
                </AspectRatio>
            {/key}
        </div>
        <header class="flex flex-col w-full">
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <h1
                class="text-2xl leading-tight font-semibold line-clamp-3"
                onclick={() => nameInput?.focus()}
            >
                {$formData.name || data.user.name}
            </h1>
            <p class="text-sm leading-tight text-muted-foreground">
                {#if $formData.username || data.user.username}
                    @{$formData.username || data.user.username}
                {/if}
            </p>
        </header>
    </section>
    <form
        class="w-full max-w-xl p-5 flex flex-col gap-2"
        action={resolve('/(app)/artist/[userResolvable]/edit', { userResolvable: data.user.id }) + '?/update'}
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
                        placeholder="Release Name"
                    />
                {/snippet}
            </FormControl>
            <FormFieldErrors/>
        </FormField>
        <FormField {form} name="username">
            <FormControl>
                {#snippet children({ props })}
                    <FormLabel>Username</FormLabel>
                    <InputGroup>
                        <InputGroupAddon>
                            <InputGroupText>@</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                            {...props}
                            bind:value={$formData.username}
                            bind:ref={nameInput}
                            disabled={$submitting}
                            placeholder="Release Name"
                        />
                    </InputGroup>
                {/snippet}
            </FormControl>
            <FormFieldErrors/>
        </FormField>
        <FormField {form} name="bio">
            <FormControl>
                {#snippet children({ props })}
                    <FormLabel>Bio</FormLabel>
                    <Textarea
                        {...props}
                        bind:value={$formData.bio}
                        disabled={$submitting}
                        placeholder="Artist Bio"
                    />
                {/snippet}
            </FormControl>
            <FormFieldErrors/>
        </FormField>
        <FormField {form} name="image">
            <FormControl>
                {#snippet children({ props })}
                    <FormLabel>Avatar</FormLabel>
                    <Input
                        {...props}
                        bind:ref={avatarInput}
                        bind:files={$imageProxy}
                        disabled={$submitting}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                    />
                {/snippet}
            </FormControl>
            <FormFieldErrors/>
        </FormField>
        <FormField {form} name="genres">
            <FormControl>
                {#snippet children({ props })}
                    <FormLabel>Genres</FormLabel>
                    <GenreSearchInput
                        {...props}
                        limit={10}
                        bind:value={$formData.genres}
                        disabled={$submitting}
                        placeholder="Search and add genres to your profile"
                    />
                {/snippet}
            </FormControl>
            <FormFieldErrors/>
        </FormField>
        <FormField {form} name="favoriteTrack">
            <FormControl>
                {#snippet children({ props })}
                    <FormLabel>Favorite Track</FormLabel>
                    <TrackSearchInput
                        {...props}
                        limit={5}
                        bind:value={
                            () => $formData.favoriteTrack as Track|undefined,
                            track => $formData.favoriteTrack = track as any
                        }
                        disabled={$submitting}
                        placeholder="Search and add your favorite track"
                    />
                {/snippet}
            </FormControl>
            <FormFieldErrors/>
        </FormField>
        <div class="flex justify-end gap-2">
            <Button
                type="submit"
                onclick={() => form.submit()}
                disabled={$submitting}
                aria-busy={$submitting}
                aria-disabled={$submitting || !!$allErrors.length}
            >
                {#if $submitting}
                    <LoaderIcon class="animate-spin"/>
                {/if}
                Submit
            </Button>
        </div>
    </form>
</div>

