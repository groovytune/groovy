<script lang="ts">
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { CirclePlusIcon, EllipsisIcon, LoaderIcon, PencilIcon, PlayIcon, Trash2Icon } from '@lucide/svelte';
    import SortTracksForm from '$lib/components/shared/app/release/forms/SortTracksForm.svelte';
    import UploadTracksForm from '$lib/components/shared/app/release/forms/UploadTracksForm.svelte';
    import ExplicitIcon from '$lib/components/shared/icons/ExplicitIcon.svelte';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio';
    import { Button } from '$lib/components/ui/button';
    import { auth } from '$lib/client/auth.js';
    import { Appwrite } from '$lib/client/appwrite.js';
    import { ImageGravity } from 'appwrite';
    import placeholderCover from '$lib/assets/cover.webp';
    import type { SuperForm } from 'sveltekit-superforms';
    import type z from 'zod';
    import type { sortTracksSchema } from '$lib/schema/track.js';
    import { resolve } from '$app/paths';
    import { AudioPlayerContext } from '$lib/contexts/player.js';
 
    let { data } = $props();

    const session = auth.useSession();
    const audioPlayer = AudioPlayerContext.get();

    let tracks = $derived(data.release.tracks);
    let sortForm = $state<SuperForm<z.infer<typeof sortTracksSchema>, unknown>|null>(null);
    let coverURL = $derived(
        data.release.cover
            ? Appwrite.storage.getFilePreview({
                bucketId: 'image',
                fileId: data.release.cover,
                gravity: ImageGravity.Center,
                height: 500,
                width: 500,
            })
            : placeholderCover
    );
</script>

<div class="w-full flex md:flex-row flex-col">
    <side class="size-full flex flex-col items-center md:max-w-96 pb-5">
        <div class="p-5 w-full max-w-sm relative">
            <AspectRatio class="w-full rounded-md bg-muted">
                <img
                    alt="Release Cover"
                    src={coverURL}
                    class="size-full object-cover rounded-md"
                />
                <img
                    alt="Release Cover"
                    src={coverURL}
                    class="size-full object-cover absolute -z-10 top-0 left-0 opacity-50 saturate-150 blur-2xl"
                />
            </AspectRatio>
        </div>
        <header class="w-full max-w-sm text-center px-5">
            <h1
                class="text-2xl leading-tight font-semibold line-clamp-3"
                style="word-wrap: break-word;"
            >
                {data.release.name}
                {#if data.release.explicit}
                    <ExplicitIcon/>
                {/if}
            </h1>
            <p class="text-sm leading-tight text-muted-foreground">
                {$session.data?.user.name || 'Unknown Artist'}
            </p>
            <p
                class="text-xs leading-tight text-muted-foreground/60 line-clamp-2 hover:line-clamp-none mt-2"
                style="word-wrap: break-word;"
                title={data.release.description}
            >
                {data.release.description || ''}
            </p>
            <div class="flex gap-2 justify-center my-5 max-w-sm px-20">
                <Button
                    onclick={async () => {
                        await audioPlayer.replaceQueue(tracks.toSorted((a, b) => a.position - b.position));
                        await audioPlayer.play();
                    }}
                    variant="outline"
                    size="icon"
                >
                    <PlayIcon/>
                </Button>
                <UploadTracksForm
                    multiple
                    releaseId={data.release.id}
                    data={data.uploadTracksForm}
                    onupload={newTracks => {
                        tracks.push(...newTracks);
                        sortForm?.form.update(f => {
                            f.tracks = [
                                ...f.tracks,
                                ...newTracks.map(t => ({ id: t.id, position: t.position }))
                            ].sort((a, b) => a.position - b.position);
                            return f;
                        }, { taint: !sortForm.isTainted() ? 'untaint-all' : undefined });
                    }}
                >
                    {#snippet children({ input, disabled, submitting })}
                        <Button
                            class="w-full"
                            onclick={() => input?.click()}
                            disabled={disabled}
                        >
                            {#if submitting}
                                <LoaderIcon class="animate-spin"/>
                                    Uploading...
                            {:else}
                                <CirclePlusIcon/>
                                Add Tracks
                            {/if}
                        </Button>
                    {/snippet}
                </UploadTracksForm>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        {#snippet child({ props })}
                            <Button {...props} variant="outline" size="icon">
                                <EllipsisIcon/>
                            </Button>
                        {/snippet}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent class="mx-2">
                        <DropdownMenuItem>
                            {#snippet child({ props })}
                                <a {...props} href={resolve('/(app)/release/[id]/edit', { id: data.release.id } )}>
                                    <PencilIcon/>
                                    Edit
                                </a>
                            {/snippet}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem class="text-destructive!">
                            <Trash2Icon class="text-current"/>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    </side>
    <SortTracksForm
        bind:tracks
        bind:form={sortForm}
        releaseId={data.release.id}
        data={data.sortTracksForm}
    />
</div>
