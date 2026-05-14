<script lang="ts">
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { Disc3Icon, DownloadIcon, EllipsisIcon, InfoIcon, MusicIcon, PencilIcon, Share2Icon, TextAlignStartIcon, Trash2Icon } from '@lucide/svelte';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '$lib/components/ui/item';
    import { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import ExplicitIcon from '$lib/components/shared/icons/ExplicitIcon.svelte';
    import type { Track } from '$lib/server/prisma/browser';
    import { Button } from '$lib/components/ui/button';
    import { Appwrite } from '$lib/client/appwrite';
    import { resolve } from '$app/paths';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import { ImageFormat, ImageGravity } from 'appwrite';
    import { formatDuration } from '$lib/helpers/utils';
    import PlayerDropdownItems from '$lib/components/shared/app/player/PlayerDropdownItems.svelte';
    import DeleteTrackDialog from '../dialogs/DeleteTrackDialog.svelte';
    import { resource } from 'runed';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import { ReleaseInfoCache } from '$lib/helpers/classes/ReleaseInfoCache.svelte';
    import ShareButton from '../ShareButton.svelte';
    import { Image } from '$lib/client/image';

    let {
        track,
        cover = false,
        editable = false,
        playingIndicator = true,
        onclick,
        ondelete
    }: {
        track: Track;
        cover?: boolean;
        editable?: boolean;
        playingIndicator?: boolean;
        onclick?: (event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement; }) => void;
        ondelete?: (trackId: string) => void;
    } = $props();

    const audioPlayer = AudioPlayer.context.get();
    const releaseInfoCache = ReleaseInfoCache.context.get();

    // svelte-ignore state_referenced_locally
    const deleteDialogState: DialogState = new DialogState({ id: `delete-track-${track.id}` });
    const artistInfo = resource(
        () => track.releaseId,
        async releaseId => releaseInfoCache.fetchReleaseArtistInfo({ releaseId }),
    );

    let isPlaying = $derived(audioPlayer.currentTrack?.id === track.id && playingIndicator);
    let coverURL = $derived(
        track.cover
            ? Image.getPreviewPath({
                fileId: track.cover,
                height: 100,
                width: 100,
                gravity: ImageGravity.Center,
                output: ImageFormat.Webp
            })
            : coverPlaceholder
    );
</script>

{#snippet ShareDropdownItem()}
    <DropdownMenuItem>
        {#snippet child({ props })}
            <ShareButton
                data={{
                    title: track.name,
                    text: `${track.name} ${artistInfo.current?.name ? 'by ' + artistInfo.current.name : ''} on Groovy`,
                    url: new URL(resolve('/(app)/release/[releaseId]', { releaseId: track.releaseId }), location.origin).href
                }}
            >
                {#snippet child({ onclick })}
                    <a {...props} {onclick}>
                        <Share2Icon/>
                        Share
                    </a>
                {/snippet}
            </ShareButton>
        {/snippet}
    </DropdownMenuItem>
{/snippet}

<Item
    oncontextmenu={e =>  e.preventDefault()}
    onclick={e => onclick?.(e)}
    class={[
        "p-2 hover:bg-secondary/50 rounded-md w-full gap-3 flex-nowrap",
        isPlaying && "bg-accent/30"
    ]}
    style="content-visibility: auto;"
>
    {#snippet child({ props })}
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a {...props}>
            {#if cover}
                <ItemMedia variant="image">
                    <img
                        alt="Track Cover"
                        src={coverURL}
                        class="rounded-md"
                    />
                </ItemMedia>
            {/if}
            <ItemContent class="gap-0 truncate leading-tight!">
                <ItemTitle
                    class={[
                        "line-clamp-1 text-balance",
                        isPlaying && "text-primary font-semibold"
                    ]}
                >
                    {track?.name ?? 'Unavailable Track'}
                    {#if track?.explicit}<ExplicitIcon class="size-4"/>{/if}
                </ItemTitle>
                <ItemDescription class="line-clamp-1 text-sm">
                    {formatDuration(track?.duration || 0)}{artistInfo.current?.name ? ` • ${artistInfo.current.name}` : ''}
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
                                    <a {...props} href={resolve('/(app)/release/[releaseId]/edit/track/[trackId]', { releaseId: track.releaseId, trackId: track.id })}>
                                        <PencilIcon/>
                                        Edit
                                    </a>
                                {/snippet}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                {#snippet child({ props })}
                                    <a {...props} href={resolve('/(app)/release/[releaseId]/edit/track/[trackId]', { releaseId: track.releaseId, trackId: track.id })}>
                                        <TextAlignStartIcon/>
                                        Edit Lyrics
                                    </a>
                                {/snippet}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                        {/if}
                        <PlayerDropdownItems tracks={[track]}/>
                        <DropdownMenuSeparator/>
                        {#if editable}
                            <DropdownMenuItem>
                                {#snippet child({ props })}
                                    <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                                    <a {...props} href={Appwrite.storage.getFileDownload({ bucketId: 'audio', fileId: track.file })} target="_blank" rel="noopener noreferrer">
                                        <DownloadIcon/>
                                        Download File
                                    </a>
                                {/snippet}
                            </DropdownMenuItem>
                            {@render ShareDropdownItem()}
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem class="text-destructive!" onclick={() => deleteDialogState.open()}>
                                <Trash2Icon class="text-current"/>
                                Delete
                            </DropdownMenuItem>
                        {:else}
                            <DropdownMenuItem>
                                {#snippet child({ props })}
                                    <a
                                        {...props}
                                        href={resolve(
                                            '/(app)/release/[releaseId]/track/[trackId]',
                                            {
                                                releaseId: track.releaseId,
                                                trackId: track.id
                                            }
                                        )}
                                    >
                                        <MusicIcon/>
                                        View Track
                                    </a>
                                {/snippet}
                            </DropdownMenuItem>
                            {#if artistInfo.current}
                                <DropdownMenuItem>
                                    {#snippet child({ props })}
                                        <a
                                            {...props}
                                            href={resolve(
                                                '/(app)/artist/[userResolvable]',
                                                {
                                                    userResolvable: artistInfo.current?.username
                                                        ? `@${artistInfo.current.username}`
                                                        : artistInfo.current!.id
                                                }
                                            )}
                                        >
                                            <Disc3Icon/>
                                            View Artist
                                        </a>
                                    {/snippet}
                                </DropdownMenuItem>
                            {/if}
                            <DropdownMenuItem>
                                {#snippet child({ props })}
                                    <!-- TODO: Implement view credits functionality -->
                                    <a {...props}>
                                        <InfoIcon/>
                                        View Credits
                                    </a>
                                {/snippet}
                            </DropdownMenuItem>
                            {@render ShareDropdownItem()}
                        {/if}
                    </DropdownMenuContent>
                </DropdownMenu>
            </ItemActions>
        </a>
    {/snippet}
</Item>
<DeleteTrackDialog
    releaseId={track.releaseId}
    tracks={[track]}
    ondelete={() => ondelete?.(track.id)}
    dialogState={deleteDialogState}
/>
