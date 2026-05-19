<script lang="ts">
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import { resolve } from '$app/paths';
    import PlayerGradientBackground from '$lib/components/shared/app/player/PlayerGradientBackground.svelte';
    import { fade } from 'svelte/transition';
    import { onDestroy, onMount } from 'svelte';

    let { children } = $props();

    const audioPlayer = AudioPlayer.context.get();

    let wakelock: WakeLockSentinel|null = $state(null);
    let backgroundLoaded = $state(false);
    let coverAPIURL = $derived(
        audioPlayer.currentTrack
            ? resolve('/(app)/api/track/[id]/cover', { id: audioPlayer.currentTrack?.id ?? '' }) + '?size=300'
            : coverPlaceholder
    );

    onMount(async () => {
        if (!('wakeLock' in navigator) || !navigator.wakeLock) return;

        wakelock = await navigator.wakeLock.request('screen');
    });

    onDestroy(() => {
        wakelock?.release();
    });
</script>

{@render children?.()}

<div
    class="fixed -z-10 top-0 left-0 w-full h-full transition-all duration-300 bg-black"
>
    <PlayerGradientBackground
        image={coverAPIURL}
        playing={!audioPlayer.paused}
        bind:loaded={backgroundLoaded}
        class="size-full"
    />
    {#if !backgroundLoaded}
        <div transition:fade={{ duration: 1000 }} class="size-full absolute top-0 left-0 -z-10">
            <div class="size-full absolute top-0 left-0 backdrop-blur-3xl backdrop-saturate-150 backdrop-brightness-75"></div>
            <img src={audioPlayer.previewCoverURL} alt={audioPlayer.currentTrack?.name || 'Track Cover'} class="size-full object-cover"/>
        </div>
    {/if}
</div>
