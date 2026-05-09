<script lang="ts">
    import PlayerGradientBackground from '$lib/components/shared/app/player/PlayerGradientBackground.svelte';
    import { FastAverageColor, type FastAverageColorResult } from 'fast-average-color';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import { resolve } from '$app/paths';
    import { untrack } from 'svelte';

    let { children } = $props();


    const audioPlayer = AudioPlayer.context.get();

    let averageColor: FastAverageColorResult|null = $state(null);

    let coverAPIURL = $derived(
        audioPlayer.currentTrack
            ? resolve('/(app)/api/track/[id]/cover', { id: audioPlayer.currentTrack?.id ?? '' }) + '?size=300'
            : coverPlaceholder
    );

    $effect(() => {
        const fac = new FastAverageColor();

        const color = coverPlaceholder !== coverAPIURL
            ? fac.getColorAsync(coverAPIURL, {
                mode: 'speed',
                algorithm: 'simple'
            }).catch(() => null)
            : null;

        untrack(() => color?.then(res => averageColor = res));
    });
</script>

{@render children?.()}

<div
    class="fixed -z-10 top-0 left-0 w-full h-full bg-(--average-color) transition-all duration-300"
    style={`--average-color: ${averageColor?.hex ?? '#000000'};`}
>
    <PlayerGradientBackground
        image={coverAPIURL}
        playing={!audioPlayer.paused}
        class="size-full bg-(--average-color)"
    />
</div>
