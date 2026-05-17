<script lang="ts">
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import PlayerTitleItem from '$lib/components/shared/app/player/PlayerTitleItem.svelte';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import TrackItem from '$lib/components/shared/app/release/track/TrackItem.svelte';
    import { ScrollArea } from '$lib/components/ui/scroll-area';

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
            class="flex flex-col gap-2 p-4 overflow-y-auto mask-t-from-90% mask-t-to-100% mask-b-from-90% mask-b-to-100%"
        >
            {#each audioPlayer.queue as track (track.id)}
                <TrackItem
                    cover={true}
                    track={track.track}
                />
            {/each}
        </ScrollArea>
    </div>
</main>
