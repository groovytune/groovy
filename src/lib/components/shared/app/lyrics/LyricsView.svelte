<script lang="ts">
    import '@applemusic-like-lyrics/core/style.css';
    import type { LayoutAlignAnchor, LyricLineMouseEvent, LyricPlayer } from '@applemusic-like-lyrics/core';
    import type { LyricLine } from '@applemusic-like-lyrics/lyric';
    import { onDestroy, onMount, untrack } from 'svelte';
    import { cn } from '$lib/helpers/utils';

    let {
        ref = $bindable(null),
        lyrics,
        currentTime,
        playing,
        hidePassedLines = true,
        alignAnchor = 'top',
        class: className = '',
        setCurrentTime
    }: {
        ref?: HTMLElement|null;
        lyrics: LyricLine[];
        currentTime: number;
        playing: boolean;
        hidePassedLines?: boolean;
        alignAnchor?: LayoutAlignAnchor;
        class?: string;
        setCurrentTime?: (time: number) => void;
    } = $props();

    let player: LyricPlayer|null = $state(null);
    let lastFrameTime = -1;

    onMount(async () => {
        const { LyricPlayer } = await import('@applemusic-like-lyrics/core');

        player = new LyricPlayer();

        player?.setLyricLines(lyrics, currentTime * 1000);
        player?.setCurrentTime(currentTime * 1000);

        player.addEventListener('line-click', onLineClick as () => void);
    });

    onDestroy(() => {
        player?.removeEventListener('line-click', onLineClick as () => void);
        player?.dispose();
    });

    $effect(() => {
        if (!player || !ref) return;

        // eslint-disable-next-line svelte/no-dom-manipulating
        ref?.appendChild(player?.getElement())
    });

    $effect(() => {
        if (!player) return;

        player.setLyricLines(lyrics, untrack(() => currentTime * 1000));
    });

    $effect(() => {
        if (!player) return;

        player.setCurrentTime(currentTime * 1000);
    });

    $effect(() => {
        if (!player) return;

        if (playing) {
            player.resume();
        } else {
            player.pause();
        }

        player.setHidePassedLines(hidePassedLines);
        player.setAlignAnchor(alignAnchor);
        player.setAlignPosition(alignAnchor === 'top' ? 0.05 : 0.45);
    });

    requestAnimationFrame(onFrame);

    function onFrame(frameTime: number) {
        const delta = lastFrameTime === -1 ? 0 : frameTime - lastFrameTime;

        lastFrameTime = frameTime;

        player?.update(delta);

        requestAnimationFrame(onFrame);
    }

    function onLineClick(event: LyricLineMouseEvent) {
        setCurrentTime?.(event.timeStamp / 1000);
    }
</script>

<style>
    :global(.FmKaba_lyricSubLine) {
        display: none;
    }

    :global(.FmKaba_lyricLine) {
        padding: 0.5em;
        padding-left: 1.5rem !important;
        padding-right: 1.5rem !important;

        &:hover {
            cursor: pointer;
            background: rgba(255, 255, 255, 0.1);
        }
    }

    :global(.FmKaba_lyricMainLine) {
        padding-left: 1em;
        padding-right: 1em;
    }

    :global(.FmKaba_interludeDots) {
        padding-left: 1rem;
        padding-right: 1rem;
    }
</style>

<div
    class={cn("size-full font-bold", className)}
    bind:this={ref}
></div>
