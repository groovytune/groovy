<script lang="ts">
    import { Appwrite } from '$lib/client/appwrite.js';
    import { PressedKeys, StateHistory, useEventListener } from 'runed';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte.js';
    import { parseLyrics, stringifyLyrics } from '$lib/helpers/lyrics';
    import type { LyricLine } from '@applemusic-like-lyrics/core';
    import LyricsEditor from '$lib/components/shared/app/lyrics/editor/LyricsEditor.svelte';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../../../../lib/components/ui/tabs/index.js';
    import { onMount } from 'svelte';

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
    let currentTime: number = $state(0);

    let lines: LyricLine[] = $state([]);
    let content: string = $state('');
    let timeData: Record<number, number> = $state({});

    const history = new StateHistory(
        () => timeData,
        newTimeData => timeData = newTimeData
    );

    useEventListener(() => audio, 'play', () => audioPlayer.pause());
    useEventListener(() => audioPlayer.audio, 'play', () => audio.pause());
    useEventListener(() => audio, ['timeupdate', 'loadedmetadata', 'seeked'], () => currentTime = audio.currentTime);

    pressedKeys.onKeys(['meta', 'z'], () => history.undo());
    pressedKeys.onKeys(['meta', 'y'], () => history.redo());
    pressedKeys.onKeys(['Control', 'z'], () => history.undo());
    pressedKeys.onKeys(['Control', 'y'], () => history.redo());

    onMount(() => {
        reset();
    });

    function reset() {
        lines = lyrics && lyrics?.format !== 'TXT' ? parseLyrics(lyrics) as LyricLine[] : [];
        content = lyrics && lyrics?.format === 'TXT' ? lyrics.content : stringifyLyrics(lines);
        timeData = lines.reduce((curr, val, index) => {
            if (val.startTime !== undefined) {
                curr[index] = val.startTime / 1000;
            }

            return curr;
        }, {} as Record<number, number>);
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
    controls
    class="w-full"
></audio>

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
                bind:timeData
            />
        </TabsContent>
        <TabsContent value="raw">
            <textarea bind:value={content} class="w-full h-full p-2 border rounded-md" placeholder="Enter lyrics here..."></textarea>
        </TabsContent>
    </Tabs>
</div>
