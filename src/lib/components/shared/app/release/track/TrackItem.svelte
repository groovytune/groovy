<script lang="ts">
    import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '$lib/components/ui/item';
    import ExplicitIcon from '$lib/components/shared/icons/ExplicitIcon.svelte';
    import type { Track } from '$lib/server/prisma/browser';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import { ImageFormat } from 'appwrite';
    import { formatDuration } from '$lib/helpers/utils';
    import { resource } from 'runed';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import { ReleaseInfoCache } from '$lib/helpers/classes/ReleaseInfoCache.svelte';
    import { Image } from '$lib/client/image';
    import TrackDropdownMenu from './TrackDropdownMenu.svelte';

    let {
        track,
        cover = false,
        editable = false,
        playingIndicator = true,
        class: className = '',
        onclick,
        ondelete
    }: {
        track: Track;
        cover?: boolean;
        editable?: boolean;
        playingIndicator?: boolean;
        class?: string;
        onclick?: (event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement; }) => void;
        ondelete?: (trackId: string) => void;
    } = $props();

    const audioPlayer = AudioPlayer.context.get();
    const releaseInfoCache = ReleaseInfoCache.context.get();

    const artistInfo = resource(
        () => track.releaseId,
        async releaseId => releaseInfoCache.fetchInfo({ releaseId, type: 'artist' }),
    );

    let isPlaying = $derived(audioPlayer.currentTrack?.id === track.id && playingIndicator);
    let coverURL = $derived(
        track.cover
            ? Image.getPreviewPath({
                fileId: track.cover,
                height: 100,
                width: 100,
                output: ImageFormat.Webp
            })
            : coverPlaceholder
    );
</script>

<Item
    oncontextmenu={e =>  e.preventDefault()}
    class={[
        "p-2 hover:bg-secondary/50 rounded-md w-full gap-3 flex-nowrap",
        isPlaying && "bg-accent/30",
        className
    ]}
    style="content-visibility: auto;"
>
    {#if cover}
        <ItemMedia variant="image" onclick={e => onclick?.(e)}>
            <img
                alt={track.name}
                src={coverURL}
                class={[
                    "rounded-md",
                    onclick && "cursor-pointer"
                ]}
            />
        </ItemMedia>
    {/if}
    <ItemContent class="gap-0 truncate leading-tight!" onclick={e => onclick?.(e)}>
        <ItemTitle
            class={[
                "line-clamp-1 text-balance",
                isPlaying && "text-primary font-semibold",
                onclick && "cursor-pointer"
            ]}
        >
            {track?.name ?? 'Unavailable Track'}
            {#if track?.explicit}<ExplicitIcon class="size-4"/>{/if}
        </ItemTitle>
        <ItemDescription class="line-clamp-1 text-xs text-foreground/60 font-medium">
            {formatDuration(track?.duration || 0)}{artistInfo.current?.name ? ` • ${artistInfo.current.name}` : ''}
        </ItemDescription>
    </ItemContent>
    <ItemActions>
        {#key track.id}
            <TrackDropdownMenu
                {track}
                {editable}
                {ondelete}
                artistInfo={artistInfo.current}
            />
        {/key}
    </ItemActions>
</Item>
