<script lang="ts">
    import { LoaderIcon, PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button/index.js';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '$lib/components/ui/item/index.js';
    import ExplicitIcon from '../icons/ExplicitIcon.svelte';
    import { resolve } from '$app/paths';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';

    const audioPlayer = AudioPlayer.context.get();
</script>

<Item variant="muted" class="w-full max-w-sm rounded-md border p-2" size="sm">
    {#snippet child({ props })}
        <a {...props} href={resolve('/(player)/player')}>
            <ItemMedia variant="image" class="-mt-1">
                <img
                    alt="Track Cover"
                    src={audioPlayer.coverURL}
                    class="now-cover size-full object-cover rounded-md"
                />
            </ItemMedia>
            <ItemContent class="gap-0">
                <ItemTitle class="now-title text-sm line-clamp-1">
                    {audioPlayer.currentTrack?.name ?? 'No Track Playing'}
                    {#if audioPlayer.currentTrack?.explicit}
                        <ExplicitIcon class="size-4 mb-0"/>
                    {/if}
                </ItemTitle>
                <ItemDescription class="now-artist text-xs line-clamp-1">
                    {audioPlayer.artistInfo.current?.name} • {audioPlayer.releaseInfo.current?.name}
                </ItemDescription>
            </ItemContent>
            <ItemActions>
                <Button variant="ghost" size="icon-sm" disabled={!audioPlayer.previousable} onclick={() => audioPlayer.previous()}>
                    <SkipBackIcon fill="currentColor"/>
                </Button>
                <Button size="icon" disabled={!audioPlayer.currentTrack} onclick={() => audioPlayer.togglePlay()}>
                    {#if audioPlayer.status == 'buffering'}
                        <LoaderIcon class="animate-spin"/>
                    {:else if audioPlayer.paused}
                        <PlayIcon fill="currentColor"/>
                    {:else}
                        <PauseIcon fill="currentColor"/>
                    {/if}
                </Button>
                <Button variant="ghost" size="icon-sm" disabled={!audioPlayer.skippable} onclick={() => audioPlayer.next()}>
                    <SkipForwardIcon fill="currentColor"/>
                </Button>
            </ItemActions>
        </a>
    {/snippet}
</Item>
