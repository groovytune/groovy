<script lang="ts">
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { DownloadIcon, EllipsisIcon, LoaderIcon, PencilIcon, SquareXIcon, TextAlignStartIcon, Trash2Icon } from '@lucide/svelte';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '$lib/components/ui/item';
    import { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import ExplicitIcon from '$lib/components/shared/ExplicitIcon.svelte';
    import ResponsiveDialog from '$lib/components/shared/ResponsiveDialog.svelte';
    import DeleteTracksForm from '../DeleteTracksForm.svelte';
    import type { Track } from '$lib/server/prisma/browser';
    import { toast } from 'svelte-sonner';
    import { Button } from '$lib/components/ui/button';
    import { auth } from '$lib/client/auth';
    import { Appwrite } from '$lib/client/appwrite';
    import { resolve } from '$app/paths';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import { ImageGravity } from 'appwrite';
    import { formatDuration } from '$lib/helpers/utils';

    let {
        track,
        cover = false,
        ondelete
    }: {
        track: Track;
        cover?: boolean;
        ondelete?: (trackId: string) => void;
    } = $props();

    const session = auth.useSession();

    // svelte-ignore state_referenced_locally
    let dialogState = new DialogState({ id: `delete-track-${track.id}` });
    let coverURL = $derived(
        track.cover
            ? Appwrite.storage.getFilePreview({
                bucketId: 'image',
                fileId: track.cover,
                height: 100,
                width: 100,
                gravity: ImageGravity.Center
            })
            : coverPlaceholder
    );
</script>

<Item
    oncontextmenu={e =>  e.preventDefault()}
    class="p-2 hover:bg-secondary/50 rounded-md"
>
    {#if cover}
        <ItemMedia variant="image">
            <AspectRatio>
                <img
                    alt="Track Cover"
                    src={coverURL}
                    class="size-full object-cover rounded-md"
                />
            </AspectRatio>
        </ItemMedia>
    {/if}
    <ItemContent>
        <ItemTitle
            class="line-clamp-2 w-full"
            style="word-wrap: break-word;"
        >
            <a
                href="#/"
                onclick={() => track && toast(track.name)}
                oncontextmenu={e =>  e.preventDefault()}
            >
                {track?.name ?? 'Unavailable Track'}
                {#if track?.explicit}
                    <ExplicitIcon class="size-4.5"/>
                {/if}
            </a>
        </ItemTitle>
        <ItemDescription>
            {formatDuration(track?.duration || 0)} • {$session.data?.user.name || 'Unknown Artist'}
        </ItemDescription>
    </ItemContent>
    <ItemActions>
        <DropdownMenu>
            <DropdownMenuTrigger>
                {#snippet child({ props })}
                    <Button {...props} variant="ghost" size="icon">
                        <EllipsisIcon/>
                    </Button>
                {/snippet}
            </DropdownMenuTrigger>
            <DropdownMenuContent class="mx-2 min-w-40">
                <DropdownMenuItem>
                    {#snippet child({ props })}
                        <a {...props} href={resolve('/(app)/release/[id]/track/[trackId]', { id: track.releaseId, trackId: track.id })}>
                            <PencilIcon/>
                            Edit
                        </a>
                    {/snippet}
                </DropdownMenuItem>
                <DropdownMenuItem>
                    {#snippet child({ props })}
                        <a {...props} href={resolve('/(app)/release/[id]/track/[trackId]/lyrics', { id: track.releaseId, trackId: track.id })}>
                            <TextAlignStartIcon/>
                            Edit Lyrics
                        </a>
                    {/snippet}
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                {#if track}
                    <DropdownMenuItem>
                        {#snippet child({ props })}
                            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                            <a {...props} href={Appwrite.storage.getFileDownload({ bucketId: 'audio', fileId: track.file })} target="_blank" rel="noopener noreferrer">
                                <DownloadIcon/>
                                Download File
                            </a>
                        {/snippet}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator/>
                {/if}
                <DropdownMenuItem class="text-destructive!" onclick={() => dialogState.open()}>
                    <Trash2Icon class="text-current"/>
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </ItemActions>
</Item>
<ResponsiveDialog {dialogState}>
    {#snippet title()}
        Delete <span class="text-primary">{track?.name ?? ''}</span>?
    {/snippet}
    {#snippet content({ type })}
        <p class:px-4={type === 'drawer'}>
            Are you sure you want to delete this track? This action cannot be undone.
        </p>
    {/snippet}
    {#snippet footer()}
        <DeleteTracksForm
            releaseId={track.releaseId}
            trackIds={[track.id]}
            onerror={() => dialogState.isClosable = true}
            ondelete={() => {
                dialogState.close({ force: true });
                ondelete?.(track.id);
            }}
        >
            {#snippet children({ form: delForm, submitting, deleted })}
                <Button
                    variant="secondary"
                    disabled={submitting || deleted}
                    onclick={() => dialogState.close({ force: true })}
                >
                    <SquareXIcon/>
                    Cancel
                </Button>
                <Button
                    variant="destructive"
                    disabled={submitting || deleted}
                    onclick={() => {
                        delForm.submit();
                        dialogState.isClosable = false;
                    }}
                >
                    {#if submitting}
                        <LoaderIcon class="animate-spin"/>
                        Deleting...
                    {:else}
                        <Trash2Icon class="text-current"/>
                        Delete
                    {/if}
                </Button>
            {/snippet}
        </DeleteTracksForm>
    {/snippet}
</ResponsiveDialog>
