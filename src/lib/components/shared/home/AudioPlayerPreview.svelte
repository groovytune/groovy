<script lang="ts">
    import { LoaderIcon, PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button/index.js';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '$lib/components/ui/item/index.js';
    import { AudioPlayerContext } from '../../../contexts/player';
    import ExplicitIcon from '../icons/ExplicitIcon.svelte';

    const audioPlayer = AudioPlayerContext.get();
</script>

<Item variant="outline" class="w-full max-w-sm rounded-md border p-2" size="sm">
    <ItemMedia variant="image" class="-mt-1">
        <img
            alt="Track Cover"
            src={audioPlayer.coverURL}
            class="size-full object-cover rounded-md"
        />
    </ItemMedia>
    <ItemContent class="gap-0">
        <ItemTitle class="text-sm">
            {audioPlayer.currentTrack?.name ?? 'No Track Playing'}
            {#if audioPlayer.currentTrack?.explicit}
                <ExplicitIcon class="size-4.5"/>
            {/if}
        </ItemTitle>
        <ItemDescription class="text-xs">
            {#if audioPlayer.releaseInfo.current}
                {audioPlayer.releaseInfo.current?.user.name} • {audioPlayer.releaseInfo.current?.name}
            {:else}
                Unknown Artist • Unknown Album
            {/if}
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
</Item>
