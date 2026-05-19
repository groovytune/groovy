<script lang="ts">
    import { Appwrite } from '$lib/client/appwrite.js';
    import { PressedKeys, StateHistory, useEventListener } from 'runed';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte.js';
    import { parseLyrics, stringifyLyrics } from '$lib/helpers/lyrics';
    import type { LyricLine } from '@applemusic-like-lyrics/core';
    import LyricsEditor from '$lib/components/shared/app/lyrics/editor/LyricsEditor.svelte';
    import { Tabs, TabsContent } from '$lib/components/ui/tabs/index.js';
    import { onMount } from 'svelte';
    import RangeSlider from 'svelte-range-slider-pips';
    import { Button } from '$lib/components/ui/button/index.js';
    import { DeleteIcon, EllipsisIcon, NotepadTextDashed, PauseIcon, PlayIcon, RotateCcwIcon, RotateCwIcon, TimelineIcon, TimerResetIcon } from '@lucide/svelte';
    import { formatDuration } from '$lib/helpers/utils.js';
    import LyricsUpload from '$lib/components/shared/app/lyrics/editor/LyricsUpload.svelte';
    import { SvelteMap } from 'svelte/reactivity';
    import type { Snapshot } from './$types.js';
    import { Textarea } from '$lib/components/ui/textarea/index.js';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '../../../../../../../../lib/components/ui/dropdown-menu/index.js';
    import DropdownMenuItem from '../../../../../../../../lib/components/ui/dropdown-menu/dropdown-menu-item.svelte';
    import Label from '../../../../../../../../lib/components/ui/label/label.svelte';

    let { data } = $props();

    const audioPlayer = AudioPlayer.context.get();
    const pressedKeys = new PressedKeys();

    let track = $derived(data.track);
    let lyrics = $derived(data.track?.lyrics);

    let audioURL: string = $derived(Appwrite.storage.getFileView({
        bucketId: 'audio',
        fileId: track.file,
    }));

    let currentView: 'editor'|'raw' = $state('editor');
    let audio: HTMLAudioElement = $state()!;
    let currentTime: number = $state(0);
    let paused: boolean = $state(true);
    let duration: number = $state(0);

    let content: string = $state('');

    const timeData: Map<number, number> = new SvelteMap();
    const history = new StateHistory(
        () => timeData.entries().toArray(),
        newTimeData => {
            timeData.clear();
            newTimeData.forEach(([index, time]) => timeData.set(index, time));
        }
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
        audio.load();
        audioPlayer.hidden = true;
        audioPlayer.pause();

        return () => {
            audioPlayer.hidden = false;
        };
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
        history.clear();
    }

    function clear() {
        content = '';
        timeData.clear();
        history.clear();
    }

    export const snapshot: Snapshot<{ timeData: [number, number][]; content: string; }> = {
        capture: () => ({ timeData: timeData.entries().toArray(), content }),
        restore: snapshot => {
            content = snapshot.content;
            timeData.clear();
            snapshot.timeData.forEach(([index, time]) => timeData.set(index, time));
            history.clear();
        }
    };
</script>

<audio
    src={audioURL}
    bind:this={audio}
    preload="auto"
    crossorigin="anonymous"
    class="w-full"
    loop
></audio>

<main class="p-5 pb-16 w-full flex flex-col">
    {#if !content}
        <div class="text-center text-muted-foreground min-h-[calc(100svh-16rem)] flex items-center justify-center">
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
            <Tabs bind:value={currentView} class="w-full md:hidden">
                <TabsContent value="editor">
                    <Label class="text-xl font-semibold mb-2 text-center block">
                        Synced Editor
                    </Label>
                    <LyricsEditor
                        bind:currentTime={
                            () => currentTime,
                            value => audio.currentTime = value
                        }
                        bind:lyrics={content}
                        {timeData}
                    />
                </TabsContent>
                <TabsContent value="raw" class="h-full pb-2">
                    <Label class="text-xl font-semibold mb-2 text-center block">
                        Raw Lyrics
                    </Label>
                    <Textarea
                        bind:value={content}
                        class="w-full h-full min-h-[calc(100svh-17rem)] p-2 border rounded-md"
                        placeholder="Enter lyrics here..."
                    />
                </TabsContent>
            </Tabs>
            <section class="hidden md:flex w-full gap-2">
                <div class="w-1/2 p-2">
                    <Label class="text-xl font-semibold mb-2">
                        Synced Editor
                    </Label>
                    <LyricsEditor
                        bind:currentTime={
                            () => currentTime,
                            value => audio.currentTime = value
                        }
                        bind:lyrics={content}
                        {timeData}
                    />
                </div>
                <div class="w-1/2 p-2">
                    <Label class="text-xl font-semibold mb-2">
                        Raw Lyrics
                    </Label>
                    <Textarea
                        bind:value={content}
                        class="w-full h-full min-h-40 px-2 font-medium border rounded-md text-base! leading-8"
                        placeholder="Enter lyrics here..."
                    />
                </div>
            </section>
        </div>
    {/if}
</main>

<section class="fixed bottom-16 sm:bottom-0 left-0 flex justify-center w-full pointer-events-none">
    <div class="flex items-center gap-1 rounded-md container pointer-events-auto pb-2 sm:px-7 px-2">
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
        <div class="bg-muted h-9 px-3 rounded-full w-full flex items-center text-xs text-muted-foreground font-medium sticky top-2 left-0">
            <span class="w-8 text-start shrink-0">{formatDuration(currentTime)}</span>
            <RangeSlider
                on:start={() => audio.pause()}
                on:change={e => audio.currentTime = e.detail.value}
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
            <span class="w-8 text-end shrink-0">{formatDuration(duration || 0)}</span>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger>
                {#snippet child({ props })}
                    <Button {...props} variant="secondary" size="icon">
                        <EllipsisIcon/>
                    </Button>
                {/snippet}
            </DropdownMenuTrigger>
            <DropdownMenuContent class="min-w-3xs" align="end">
                <DropdownMenuItem onclick={reset}>
                    <TimerResetIcon/>
                    Reset Lyrics
                </DropdownMenuItem>
                <DropdownMenuItem
                    disabled={!content.trim()}
                    onclick={clear}
                >
                    <DeleteIcon/>
                    Clear Lyrics
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem
                    disabled={!history.canRedo}
                    onclick={() => history.redo()}
                    closeOnSelect={false}
                >
                    <RotateCwIcon/>
                    Redo Action
                    <DropdownMenuShortcut>
                        ⌘+Y
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                    disabled={!history.canUndo}
                    onclick={() => history.undo()}
                    closeOnSelect={false}
                >
                    <RotateCcwIcon/>
                    Undo Action
                    <DropdownMenuShortcut>
                        ⌘+Z
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator class="sm:hidden"/>
                <DropdownMenuItem
                    onclick={() => currentView = currentView === 'editor' ? 'raw' : 'editor'}
                    closeOnSelect={false}
                    class="sm:hidden"
                >
                    {#if currentView === 'editor'}
                        <NotepadTextDashed/>
                        Switch to Raw Lyrics
                    {:else}
                        <TimelineIcon/>
                        Switch to Synced Editor
                    {/if}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
</section>
