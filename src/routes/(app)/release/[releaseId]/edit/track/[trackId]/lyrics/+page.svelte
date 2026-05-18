<script lang="ts">
    import { Appwrite } from '$lib/client/appwrite.js';
    import { PressedKeys, StateHistory, useEventListener } from 'runed';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte.js';
    import { SvelteMap } from 'svelte/reactivity';
    import { parseLyrics, stringifyLyrics } from '$lib/helpers/lyrics';
    import type { LyricLine } from '@applemusic-like-lyrics/core';
    import { formatDuration } from '$lib/helpers/utils.js';
    import { Badge } from '$lib/components/ui/badge/index.js';

    let { data } = $props();

    const audioPlayer = AudioPlayer.context.get();
    const pressedKeys = new PressedKeys();

    let track = $derived(data.track);
    let lyrics = $derived(data.track?.lyrics);

    let audioURL: string = $derived(Appwrite.storage.getFileView({
        bucketId: 'audio',
        fileId: track.file,
    }));

    let audio: HTMLAudioElement = $state()!;
    let currentTimeMs: number = $state(0);
    let currentLyricIndex: number = $state(0);

    let lyricsContent = $derived(stringifyLyrics(parseLyrics(lyrics) as LyricLine[]));
    let lyricsLines = $derived(lyricsContent.split('\n'));
    let timeData = new SvelteMap<number, number>();

    $effect(() => {
        const parsed = parseLyrics(lyrics) as LyricLine[];

        timeData.clear();
        parsed.forEach((line, index) => {
            if (line.startTime !== undefined) {
                timeData.set(index, line.startTime);
            }
        });
    });

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

    export const snapshot = {
        capture: () => ({
            timeData: timeData.entries().toArray(),
        }),
        restore: snapshot => {
            timeData.clear();
            for (const [index, time] of snapshot.timeData) {
                timeData.set(index, time);
            }
        },
    };
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

<div class="flex gap-2">
    {#if lyricsContent}
        <div class="flex flex-col gap-2">
            {#each lyricsLines as line, index (index)}
                {@const timeStamp = timeData.get(index)}
                {@const isActive = timeStamp !== undefined && currentTimeMs >= timeStamp}
                {@const isCurrent = index === currentLyricIndex}
                <div
                    data-lyric-index={index}
                    class="flex gap-2 transition-all duration-300"
                    class:text-muted-foreground={!isActive}
                    class:text-primary={isCurrent}
                    class:font-medium={isCurrent}
                >
                    <Badge
                        class="w-16 cursor-pointer"
                        variant={isCurrent ? "default" : "outline"}
                        onclick={e => {
                            e.preventDefault();
                            if (timeStamp !== undefined) {
                                audio.currentTime = timeStamp / 1000;
                            }
                        }}
                    >
                        {#if timeStamp !== undefined}
                            {formatDuration(timeStamp / 1000 , 'mm:ss')}
                        {:else}
                            --:--
                        {/if}
                    </Badge>
                    <a
                        href="#/"
                        onclick={e => {
                            e.preventDefault();
                            currentLyricIndex = index;
                        }}
                    >
                        {line}
                    </a>
                </div>
            {/each}
        </div>
    {:else}
        <p>No lyrics available for this track.</p>
    {/if}
    <div class="w-1/2">
        <textarea bind:value={lyricsContent} class="w-full h-full p-2 border rounded-md" placeholder="Enter lyrics here..."></textarea>
    </div>
</div>
