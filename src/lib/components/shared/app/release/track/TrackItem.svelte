<script lang="ts">
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { DownloadIcon, EllipsisIcon, PencilIcon, TextAlignStartIcon, Trash2Icon } from '@lucide/svelte';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '$lib/components/ui/item';
    import { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import ExplicitIcon from '$lib/components/shared/icons/ExplicitIcon.svelte';
    import type { Track } from '$lib/server/prisma/browser';
    import { Button } from '$lib/components/ui/button';
    import { auth } from '$lib/client/auth';
    import { Appwrite } from '$lib/client/appwrite';
    import { resolve } from '$app/paths';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import { ImageGravity } from 'appwrite';
    import { formatDuration } from '$lib/helpers/utils';
    import PlayerDropdownItems from '$lib/components/shared/app/player/PlayerDropdownItems.svelte';
    import { AudioPlayerContext } from '$lib/contexts/player';
    import NowPlayingIcon from '$lib/components/shared/icons/NowPlayingIcon.svelte';
    import DeleteTrackDialog from '../dialogs/DeleteTrackDialog.svelte';

    let {
        track,
        cover = false,
        editable = false,
        ondelete
    }: {
        track: Track;
        cover?: boolean;
        editable?: boolean;
        ondelete?: (trackId: string) => void;
    } = $props();

    const session = auth.useSession();
    const audioPlayer = AudioPlayerContext.get();

    // svelte-ignore state_referenced_locally
    const deleteDialogState: DialogState = new DialogState({ id: `delete-track-${track.id}` });;

    let isPlaying = $derived(audioPlayer.currentTrack?.id === track.id);
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
    class={[
        "p-2 hover:bg-secondary/50 rounded-md w-full",
        isPlaying && "bg-accent/30"
    ]}
    style="content-visibility: auto;"
>
    {#snippet child({ props })}
        <a {...props} href={resolve('/(app)/release/[id]/edit/track/[trackId]', { id: track.releaseId, trackId: track.id })}>
            <ItemContent>
                <ItemTitle
                    class={[
                        "line-clamp-2 w-full",
                        isPlaying && "text-primary font-semibold"
                    ]}
                    style="word-wrap: break-word;"
                >
                    {#if isPlaying}<NowPlayingIcon class="size-4"/>{/if}{track?.name ?? 'Unavailable Track'}
                    {#if track?.explicit}<ExplicitIcon class="size-4"/>{/if}
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
                        {#if editable}
                            <DropdownMenuItem>
                                {#snippet child({ props })}
                                    <a {...props} href={resolve('/(app)/release/[id]/edit/track/[trackId]', { id: track.releaseId, trackId: track.id })}>
                                        <PencilIcon/>
                                        Edit
                                    </a>
                                {/snippet}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                {#snippet child({ props })}
                                    <a {...props} href={resolve('/(app)/release/[id]/edit/track/[trackId]', { id: track.releaseId, trackId: track.id })}>
                                        <TextAlignStartIcon/>
                                        Edit Lyrics
                                    </a>
                                {/snippet}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                        {/if}
                        <PlayerDropdownItems tracks={[track]}/>
                        {#if editable}
                            <DropdownMenuSeparator/>
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
                            <DropdownMenuItem class="text-destructive!" onclick={() => deleteDialogState.open()}>
                                <Trash2Icon class="text-current"/>
                                Delete
                            </DropdownMenuItem>
                        {/if}
                    </DropdownMenuContent>
                </DropdownMenu>
            </ItemActions>
        </a>
    {/snippet}
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
</Item>
<DeleteTrackDialog
    releaseId={track.releaseId}
    tracks={[track]}
    ondelete={() => ondelete?.(track.id)}
    dialogState={deleteDialogState}
/>
