<script lang="ts">
    import RangeSlider from 'svelte-range-slider-pips';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import { cn } from '$lib/helpers/utils';
    import type { ClassValue } from 'clsx';

    let props: {
        class?: ClassValue;
    } & Record<string, unknown> = $props();

    const audioPlayer = AudioPlayer.context.get();

    let snapshot: number = $derived(audioPlayer.currentTime);
</script>

<RangeSlider
    on:start={() => audioPlayer.pause()}
    on:stop={e => {
        audioPlayer.play();
        audioPlayer.seek(e.detail.value);
        snapshot = e.detail.value;
    }}
    value={snapshot}
    step={0.5}
    range="min"
    min={0}
    max={audioPlayer.duration || 0.1}
    springValues={{ stiffness: 0.3, damping: 0.9 }}
    disabled={!audioPlayer.currentTrack}
    {...props}
    class={cn("m-0! w-full", props.class)}
/>
