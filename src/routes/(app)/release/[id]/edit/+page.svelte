<script lang="ts">
    import { superForm } from 'sveltekit-superforms';
    import { zod4Client } from 'sveltekit-superforms/adapters';
    import { editReleaseSchema } from '$lib/schema/release.js';
    import { Button } from '$lib/components/ui/button/index.js';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio/index.js';
    import { auth } from '$lib/client/auth.js';
    import ExplicitIcon from '$lib/components/shared/icons/ExplicitIcon.svelte';
    import { ListMusicIcon, LoaderIcon, PlayIcon } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';
    import placeholderCover from '$lib/assets/cover.webp';
    import { resolve } from '$app/paths';
    import ReleaseFormFields from '$lib/components/shared/app/release/forms/fields/ReleaseFormFields.svelte';
    import { Appwrite } from '$lib/client/appwrite.js';
    import { ImageGravity } from 'appwrite';
    import type { GETResponse } from '../../../api/release/[id]/tracks/+server.js';
    import { AudioPlayerContext } from '$lib/contexts/player.js';

    let { data } = $props();

    // svelte-ignore state_referenced_locally
    const form = superForm(data.form, {
        validators: zod4Client(editReleaseSchema),
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

    const { form: formData, enhance, submitting, allErrors } = form;

    const session = auth.useSession();
    const audioPlayer = AudioPlayerContext.get();

    let coverInput: HTMLInputElement|null = $state(null);
    let nameInput: HTMLInputElement|null = $state(null);

    let coverURL = $derived(
        $formData.cover
            ? URL.createObjectURL($formData.cover)
            : data.release.cover
                ? Appwrite.storage.getFilePreview({
                    bucketId: 'image',
                    fileId: data.release.cover,
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
                {$formData.name || 'Untitled Release'}
                {#if $formData.explicit}
                    <ExplicitIcon/>
                {/if}
            </h1>
            <p class="text-sm leading-tight text-muted-foreground">
                {$session.data?.user.name || 'Unknown Artist'}
            </p>
            <p
                class="text-xs leading-tight text-muted-foreground/60 line-clamp-2 hover:line-clamp-none mt-2"
                style="word-wrap: break-word;"
                title={$formData.description}
            >
                {$formData.description || ''}
            </p>
            <div class="flex gap-2 justify-center mt-5 max-w-sm px-20">
                <Button
                    variant="outline"
                    size="icon"
                    onclick={async () => {
                        const tracks = await fetch(resolve('/(app)/api/release/[id]/tracks', { id: data.release.id })).then(res => res.json()) as GETResponse;

                        await audioPlayer.replaceQueue(tracks.toSorted((a, b) => a.position - b.position));
                        await audioPlayer.play();
                    }}
                >
                    <PlayIcon/>
                </Button>
                <Button
                    href={resolve('/(app)/release/[id]/edit/tracks', { id: data.release.id })}
                    variant="outline"
                >
                    <ListMusicIcon/>
                    Manage Tracks
                </Button>
            </div>
        </header>
    </section>
    <form
        class="w-full md:max-w-[calc(100%-24rem)] p-5 flex flex-col gap-2"
        action={resolve('/(app)/release/[id]/edit', { id: data.release.id })}
        method="POST"
        enctype="multipart/form-data"
        use:enhance
    >
        <ReleaseFormFields {form} bind:coverInput bind:nameInput/>
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
