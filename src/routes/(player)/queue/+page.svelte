<script lang="ts">
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import PlayerTitleItem from '$lib/components/shared/app/player/PlayerTitleItem.svelte';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import PlayerProgressBar from '$lib/components/shared/app/player/PlayerProgressBar.svelte';
    import PlayerControls from '$lib/components/shared/app/player/PlayerControls.svelte';
    import { formatDuration } from '$lib/helpers/utils';
    import PlayerQueueOrder from '$lib/components/shared/app/player/PlayerQueueOrder.svelte';
    import { ScrollArea } from '../../../lib/components/ui/scroll-area';

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
        {#if audioPlayer.queue.length}
            <ScrollArea class="h-full px-4 overflow-y-auto pt-1">
                <PlayerQueueOrder itemClass="ps-3"/>
            </ScrollArea>
        {:else}
            <div class="h-full flex flex-col items-center justify-center gap-4 text-center px-4">
                <p class="text-xl text-white/70">Your queue is empty</p>
            </div>
        {/if}
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
