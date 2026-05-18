<script lang="ts">
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import PlayerTitleItem from '$lib/components/shared/app/player/PlayerTitleItem.svelte';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import TrackItem from '$lib/components/shared/app/release/track/TrackItem.svelte';
    import { ScrollArea } from '$lib/components/ui/scroll-area';
    import PlayerProgressBar from '$lib/components/shared/app/player/PlayerProgressBar.svelte';
    import PlayerControls from '$lib/components/shared/app/player/PlayerControls.svelte';
    import { formatDuration } from '$lib/helpers/utils';
    import { dndzone } from 'svelte-dnd-action';
    import { flip } from 'svelte/animate';

    const audioPlayer = AudioPlayer.context.get();
</script>
<main class="flex size-full justify-center relative gap-2 text-white! dark select-none">
    <div class="h-full w-full max-w-xl flex flex-col py-6 relative">
        <PlayerTitleItem
            class="px-6 py-0 shrink-0"
            titleClassName="text-sm! mt-2"
            artistClassName="text-xs! font-medium"
            cover={true}
            addReleaseName={true}
            oncoverclick={() => goto(resolve('/(player)/player'))}
        />
        <ScrollArea
            class="h-full p-4 overflow-y-auto mask-t-from-90% mask-t-to-100% mask-b-from-90% mask-b-to-100%"
        >
            <div
                use:dndzone={{
                    dragDisabled: audioPlayer.queue.length < 2,
                    items: audioPlayer.queue,
                    flipDurationMs: 100,
                    delayTouchStart: 500,
                    dropTargetStyle: {},
                    useCursorForDetection: true
                }}
                onconsider={e => audioPlayer.queue = e.detail.items}
                onfinalize={e => audioPlayer.queue = e.detail.items}
                class="flex flex-col gap-1 py-3"
            >
                {#each audioPlayer.queue as track, index (track.id)}
                    <div
                        animate:flip={{ duration: 100 }}
                        class="w-full flex gap-2 items-center"
                    >
                        <span class="text-sm text-white/50">{index + 1}</span>
                        <TrackItem
                            cover={true}
                            track={track.track}
                        />
                    </div>
                {/each}
            </div>
        </ScrollArea>
        <section class="w-full p-6">
            <div class="grid w-full gap-2 text-xs text-muted-foreground">
                <PlayerProgressBar class="mono"/>
                <div class="flex justify-between font-medium text-white/60">
                    <span class="w-6 text-start">{audioPlayer.currentTrack ? formatDuration(audioPlayer.currentTime || 0) : '--:--'}</span>
                    <span class="w-6 text-end">{audioPlayer.currentTrack ? formatDuration(audioPlayer.duration || 0) : '--:--'}</span>
                </div>
            </div>
            <div class="flex justify-around items-center">
                <PlayerControls/>
            </div>
        </section>
    </div>
</main>
