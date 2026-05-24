<script lang="ts">
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import TrackItem from '$lib/components/shared/app/release/track/TrackItem.svelte';
    import { dragHandle, dragHandleZone } from 'svelte-dnd-action';
    import { flip } from 'svelte/animate';
    import { EqualIcon } from '@lucide/svelte';
    import { cn } from '$lib/helpers/utils';

    const audioPlayer = AudioPlayer.context.get();

    let {
        class: className = '',
        itemClass = ''
    }: {
        class?: string;
        itemClass?: string;
    } = $props();
</script>

<div
    use:dragHandleZone={{
        dragDisabled: audioPlayer.queue.length < 2,
        items: audioPlayer.queue,
        flipDurationMs: 100,
        delayTouchStart: 500,
        dropTargetStyle: {},
        useCursorForDetection: true
    }}
    onconsider={e => audioPlayer.queue = e.detail.items}
    onfinalize={e => audioPlayer.queue = e.detail.items}
    class={cn("flex flex-col gap-1 py-3", className)}
>
    {#each audioPlayer.queue as track, index (track.id)}
        <div
            animate:flip={{ duration: 100 }}
            class={cn("w-full flex gap-2 items-center min-h-14", itemClass)}
        >
            <span
                use:dragHandle
                class="text-sm text-white/50"
                aria-label="Drag handle for track number {index + 1} ({track.track.name})"
            >
                <EqualIcon class="size-5"/>
            </span>
            <TrackItem
                cover={true}
                track={track.track}
                playingIndicator={false}
                onclick={e => {
                    e.preventDefault();
                    audioPlayer.next(index);
                }}
            />
        </div>
    {/each}
</div>
