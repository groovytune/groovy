<script lang="ts">
    import { Appwrite } from '$lib/client/appwrite.js';
    import { PressedKeys, StateHistory, useEventListener } from 'runed';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte.js';
    import { parseLyrics, stringifyLyrics } from '$lib/helpers/lyrics';
    import type { LyricLine } from '@applemusic-like-lyrics/core';
    import LyricsEditor from '$lib/components/shared/app/lyrics/editor/LyricsEditor.svelte';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../../../../lib/components/ui/tabs/index.js';
    import { onMount } from 'svelte';
    import RangeSlider from 'svelte-range-slider-pips';
    import { Button } from '../../../../../../../../lib/components/ui/button/index.js';
    import { PauseIcon, PlayIcon } from '@lucide/svelte';
    import { formatDuration } from '../../../../../../../../lib/helpers/utils.js';
    import { auth } from '../../../../../../../../lib/client/auth.js';
    import LyricsUpload from '../../../../../../../../lib/components/shared/app/lyrics/editor/LyricsUpload.svelte';
    import { SvelteMap } from 'svelte/reactivity';

    let { data } = $props();

    const audioPlayer = AudioPlayer.context.get();
    const pressedKeys = new PressedKeys();
    const session = auth.useSession();

    let track = $derived(data.track);
    let lyrics = $derived(data.track?.lyrics);

    let audioURL: string = $derived(Appwrite.storage.getFileView({
        bucketId: 'audio',
        fileId: track.file,
    }));

    let audio: HTMLAudioElement = $state()!;
    let currentTime: number = $state(0);
    let paused: boolean = $state(true);
    let duration: number = $state(0);

    let content: string = $state('');
    let timeData: Map<number, number> = new SvelteMap();

    const history = new StateHistory(
        () => timeData,
        newTimeData => timeData = newTimeData
    );

    useEventListener(() => audio, 'play', () => audioPlayer.pause());
    useEventListener(() => audioPlayer.audio, 'play', () => audio.pause());
    useEventListener(() => audio, ['timeupdate', 'loadedmetadata', 'seeked'], () => currentTime = audio.currentTime);
    useEventListener(() => audio, ['play', 'pause'], () => paused = audio.paused);
    useEventListener(() => audio, ['loadedmetadata', 'loaded'], () => duration = audio.duration);

    pressedKeys.onKeys(['meta', 'z'], () => history.undo());
    pressedKeys.onKeys(['meta', 'y'], () => history.redo());
    pressedKeys.onKeys(['Control', 'z'], () => history.undo());
    pressedKeys.onKeys(['Control', 'y'], () => history.redo());

    onMount(() => {
        reset();
    });

    function reset() {
        const lines = lyrics && lyrics?.format !== 'TXT' ? parseLyrics(lyrics) as LyricLine[] : [];

        content = lyrics && lyrics?.format === 'TXT' ? lyrics.content : stringifyLyrics(lines);

        timeData.clear();
        lines.forEach((line, index) => {
            if (line.startTime !== undefined) {
                timeData.set(index, line.startTime / 1000);
            }
        });
    }

    export const snapshot = {
        capture: () => ({ timeData: timeData }),
        restore: snapshot => timeData = snapshot.timeData
    };
</script>

<audio
    src={audioURL}
    bind:this={audio}
    preload="auto"
    crossorigin="anonymous"
    class="w-full"
></audio>

<main class="p-5 w-full flex flex-col">
    <section class="flex flex-col items-center gap-4 mb-5 w-full shrink-0">
        <div class="flex items-center gap-2 rounded-md w-full">
            <Button
                size="icon"
                variant="default"
                onclick={() => {
                    if (paused) {
                        audio.play();
                    } else {
                        audio.pause();
                    }
                }}
            >
                {#if paused}
                    <PlayIcon/>
                {:else}
                    <PauseIcon/>
                {/if}
            </Button>
            <div class="bg-muted h-10 px-4 rounded-full w-full flex items-center text-xs text-muted-foreground font-medium sticky top-2 left-0">
                <span class="w-10 text-start shrink-0">{formatDuration(currentTime)}</span>
                <RangeSlider
                    on:start={() => audio.pause()}
                    on:stop={e => {
                        audio.play();
                        audio.currentTime = e.detail.value;
                    }}
                    value={currentTime}
                    step={0.5}
                    range="min"
                    min={0}
                    max={duration || 0.1}
                    springValues={{ stiffness: 0.3, damping: 0.9 }}
                    disabled={!duration}
                    class="m-0! w-full"
                />
                <span class="w-10 text-end shrink-0">{formatDuration(duration || 0)}</span>
            </div>
        </div>
        <div class="text-center">
            <h1 class="text-2xl font-bold">{track.name}</h1>
            <p class="text-sm text-muted-foreground">{$session.data?.user.name} • {track.release.name}</p>
        </div>
    </section>
    {#if !content}
        <div class="p-4 text-center text-muted-foreground h-full flex items-center justify-center">
            <LyricsUpload
                onParse={(data) => {
                    content = data.content;

                    timeData.clear();
                    data.timeData.forEach(([index, time]) => timeData.set(index, time));

                    history.clear();
                }}
            />
        </div>
    {:else}
        <div class="flex gap-2">
            <Tabs value="editor" class="w-full">
                <TabsList>
                    <TabsTrigger value="editor">Editor</TabsTrigger>
                    <TabsTrigger value="raw">Raw</TabsTrigger>
                </TabsList>
                <TabsContent value="editor">
                    <LyricsEditor
                        bind:currentTime={
                            () => currentTime,
                            value => audio.currentTime = value
                        }
                        bind:lyrics={content}
                        timeData={timeData}
                    />
                </TabsContent>
                <TabsContent value="raw">
                    <textarea bind:value={content} class="w-full h-full p-2 border rounded-md" placeholder="Enter lyrics here..."></textarea>
                </TabsContent>
            </Tabs>
        </div>
    {/if}
</main>
