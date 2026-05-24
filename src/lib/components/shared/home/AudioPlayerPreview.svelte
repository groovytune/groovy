<script lang="ts">
    import { LoaderCircleIcon, PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '$lib/components/ui/item';
    import ExplicitIcon from '../icons/ExplicitIcon.svelte';
    import { resolve } from '$app/paths';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import type { HTMLAttributes } from 'svelte/elements';
    import { cn } from '$lib/helpers/utils';

    let props: HTMLAttributes<HTMLDivElement> = $props();

    const audioPlayer = AudioPlayer.context.get();
</script>

<Item
    variant="muted"
    size="sm"
    {...props}
    class={cn("w-full max-w-sm rounded-lg border p-2", props.class)}
>
    <ItemMedia variant="image" class="-mt-1">
        <img
            alt={audioPlayer.currentTrack?.name ?? 'No Track Playing'}
            src={audioPlayer.coverURL}
            class="now-cover size-full object-cover rounded-md"
        />
    </ItemMedia>
    <ItemContent class="gap-0">
        <ItemTitle class="now-title text-sm line-clamp-1">
            <a href={resolve('/(player)/player')}>
                {audioPlayer.currentTrack?.name ?? 'No Track Playing'}
                {#if audioPlayer.currentTrack?.explicit}
                    <ExplicitIcon class="size-4 mb-0"/>
                {/if}
            </a>
        </ItemTitle>
        <ItemDescription class="now-artist text-xs line-clamp-1">
            <a href={resolve('/(player)/player')} class="text-muted-foreground!">
                {audioPlayer.artistInfo.current?.name} • {audioPlayer.releaseInfo.current?.name}
            </a>
        </ItemDescription>
    </ItemContent>
    <ItemActions>
        <Button variant="ghost" size="icon-sm" disabled={!audioPlayer.previousable} onclick={() => audioPlayer.previous()}>
            <SkipBackIcon fill="currentColor"/>
        </Button>
        <Button size="icon" disabled={!audioPlayer.currentTrack} onclick={() => audioPlayer.togglePlay()}>
            {#if audioPlayer.status == 'buffering'}
                <LoaderCircleIcon class="animate-spin"/>
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
</Item>
