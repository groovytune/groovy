<script lang="ts">
    import { Appwrite } from '$lib/client/appwrite.js';
    import { PressedKeys, StateHistory, useEventListener } from 'runed';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte.js';
    import { SvelteMap } from 'svelte/reactivity';
    import { parseLyrics, stringifyLyrics } from '$lib/helpers/lyrics';
    import type { Lyrics } from '$lib/server/prisma/browser';
    import type { LyricLine } from '@applemusic-like-lyrics/core';
    import { formatDuration } from '$lib/helpers/utils.js';
    import { Badge } from '$lib/components/ui/badge/index.js';

    let { data } = $props();

    const audioPlayer = AudioPlayer.context.get();
    const pressedKeys = new PressedKeys();

    let lyrics = $derived(data.lyrics as Lyrics);
    let track = $derived(data.lyrics.track);

    let audioURL: string = $derived(Appwrite.storage.getFileView({
        bucketId: 'audio',
        fileId: track.file,
    }));

    let audio: HTMLAudioElement = $state()!;
    let currentTimeMs: number = $state(0);
    let currentLyricIndex: number = $state(0);

    let lyricsContent = $derived(stringifyLyrics(parseLyrics(lyrics) as LyricLine[]));
    let lyricsLines = $derived(lyricsContent.split('\n'));
    let timeData = new SvelteMap<number, number>([
        [0, 20000],
        [1, 40000],
        [2, 60000],
    ]);

    const history = new StateHistory(
        () => timeData.entries().toArray(),
        newTimeData => {
            timeData.clear();

            for (const [index, time] of newTimeData) {
                timeData.set(index, time);
            }
        }
    );

    useEventListener(() => audio, 'play', () => audioPlayer.pause());
    useEventListener(() => audioPlayer.audio, 'play', () => audio.pause());
    useEventListener(() => audio, ['timeupdate', 'loadedmetadata', 'seeked'], () => currentTimeMs = audio.currentTime * 1000);

    pressedKeys.onKeys(['meta', 'z'], () => history.undo());
    pressedKeys.onKeys(['meta', 'y'], () => history.redo());
    pressedKeys.onKeys(['Control', 'z'], () => history.undo());
    pressedKeys.onKeys(['Control', 'y'], () => history.redo());
</script>

<svelte:window
    onkeypress={event => {
        const hasModifier = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
        if (event.key !== ' ' || hasModifier) return;

        event.preventDefault();

        timeData.set(currentLyricIndex, currentTimeMs);
        currentLyricIndex = currentLyricIndex + 1 < lyricsLines.length ? currentLyricIndex + 1 : currentLyricIndex;

        const currentLine = document.querySelector(`[data-lyric-index="${currentLyricIndex}"]`);
        if (currentLine) currentLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }}
/>

<audio
    src={audioURL}
    bind:this={audio}
    preload="auto"
    crossorigin="anonymous"
    controls
    class="w-full"
></audio>

{#if lyricsContent}
    <div class="flex flex-col gap-2">
        {#each lyricsLines as line, index (index)}
            {@const timeStamp = timeData.get(index)}
            {@const isActive = timeStamp !== undefined && currentTimeMs >= timeStamp}
            {@const isCurrent = index === currentLyricIndex}
            <a
                href="#/"
                data-lyric-index={index}
                onclick={e => {
                    e.preventDefault();
                    currentLyricIndex = index;
                }}
                class="flex gap-2"
                class:text-muted-foreground={!isActive}
                class:text-primary={isCurrent}
                class:font-semibold={isCurrent}
            >
                <Badge variant={isCurrent ? "default" : "outline"} class="w-14">
                    {#if timeStamp !== undefined}
                        {formatDuration(timeStamp)}
                    {:else}
                        --:--
                    {/if}
                </Badge>
                <span>{line}</span>
            </a>
        {/each}
    </div>
{:else}
    <p>No lyrics available for this track.</p>
{/if}
