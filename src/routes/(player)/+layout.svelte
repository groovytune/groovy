<script lang="ts">
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import PlayerGradientBackground from '$lib/components/shared/app/player/PlayerGradientBackground.svelte';
    import { fade } from 'svelte/transition';
    import { onDestroy, onMount } from 'svelte';
    import { Image } from '$lib/client/image';
    import { ImageFormat } from 'appwrite';

    let { children } = $props();

    const audioPlayer = AudioPlayer.context.get();

    let wakelock: WakeLockSentinel|null = $state(null);
    let backgroundLoaded = $state(false);
    let coverAPIURL = $derived(
        audioPlayer.currentTrack?.cover ?? audioPlayer.releaseInfo.current?.cover
            ? Image.getPreviewPath({
                fileId: audioPlayer.currentTrack?.cover ?? audioPlayer.releaseInfo.current!.cover!,
                width: 300,
                height: 300,
                output: ImageFormat.Webp
            })
            : coverPlaceholder
    );

    onMount(async () => {
        await requestWakeLock();
    });

    onDestroy(() => {
        wakelock?.release();
    });

    async function requestWakeLock() {
        if (!('wakeLock' in navigator) || !navigator.wakeLock) return;

        if (wakelock) return;

        try {
            wakelock = await navigator.wakeLock.request('screen');
            wakelock.addEventListener('release', () => {
                wakelock = null;
            }, { once: true });
        } catch (err) {
            console.error('Failed to acquire wake lock:', err);
        }
    }
</script>

<svelte:window
    onvisibilitychange={() => {
        if (document.visibilityState === 'visible') {
            requestWakeLock();
        } else {
            wakelock?.release();
        }
    }}
/>

{@render children?.()}

<div
    class="fixed -z-10 top-0 left-0 w-full h-full transition-all duration-300 bg-black"
>
    <PlayerGradientBackground
        image={coverAPIURL}
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
