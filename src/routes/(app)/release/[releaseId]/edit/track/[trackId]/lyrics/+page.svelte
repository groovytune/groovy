<script lang="ts">
    import { Appwrite } from '$lib/client/appwrite.js';
    import { PressedKeys, StateHistory, useEventListener } from 'runed';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte.js';
    import { parseLyrics, stringifyLyrics } from '$lib/helpers/lyrics';
    import type { LyricLine } from '@applemusic-like-lyrics/core';
    import LyricsEditor from '$lib/components/shared/app/lyrics/editor/LyricsEditor.svelte';
    import { Tabs, TabsContent } from '$lib/components/ui/tabs';
    import { onMount } from 'svelte';
    import RangeSlider from 'svelte-range-slider-pips';
    import { Button } from '$lib/components/ui/button';
    import { ArrowDownIcon, ArrowUpIcon, BetweenHorizontalEndIcon, DeleteIcon, DownloadIcon, EllipsisVerticalIcon, PauseIcon, PencilLineIcon, PlayIcon, RotateCcwIcon, RotateCwIcon, SaveIcon, TimelineIcon, TimerResetIcon } from '@lucide/svelte';
    import { formatDuration } from '$lib/helpers/utils.js';
    import LyricsUpload from '$lib/components/shared/app/lyrics/editor/LyricsUpload.svelte';
    import { MediaQuery, SvelteMap } from 'svelte/reactivity';
    import type { Snapshot } from './$types.js';
    import { Textarea } from '$lib/components/ui/textarea';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import DropdownMenuItem from '$lib/components/ui/dropdown-menu/dropdown-menu-item.svelte';
    import Label from '$lib/components/ui/label/label.svelte';
    import { superForm } from 'sveltekit-superforms';
    import { zod4Client } from 'sveltekit-superforms/adapters';
    import { newLyricsSchema } from '$lib/schema/lyrics.js';
    import { toast } from 'svelte-sonner';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { slug } from 'github-slugger';

    let { data } = $props();

    const audioPlayer = AudioPlayer.context.get();
    const pressedKeys = new PressedKeys();
    const isTouchUI = new MediaQuery('(width >= 48rem)');

    // svelte-ignore state_referenced_locally
    const form = superForm(data.form, {
        validators: zod4Client(newLyricsSchema),
        clearOnSubmit: 'errors-and-message',
        dataType: 'json',
        autoFocusOnError: true,
        validationMethod: 'auto',
        taintedMessage: true,
        invalidateAll: false,
        resetForm: false,
        onError: event => {
            console.error('Form submission error:', event.result);
            toast.error(event.result.error.message);
        },
        onResult: event => {
            const { type } = event.result;

            if (type === 'failure') {
                console.error('Form submission failed:', event.result);
                toast.error(event.result.data?.message ?? 'Failed to save changes.');
                return;
            }

            if (type != 'success') return;

            const message = event.result.data?.form.message;
            toast.success(message.message ?? 'Changes saved successfully!');
        }
    });

    const { enhance, submitting, allErrors, form: formData } = form;

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
    let currentLyricIndex: number = $state(0);

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

    $effect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        timeData;

        $formData.format = 'LRC';
        $formData.content = toLrcString();
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

    function setLyricTimestamp(index: number, time: number) {
        timeData.set(index, time);
        setCurrentLyricIndex(index + 1);
    }

    function setCurrentLyricIndex(index: number) {
        currentLyricIndex = Math.max(0, Math.min(content.split('\n').length - 1, index));

        const currentLine = document.querySelector(`[data-lyric-index="${currentLyricIndex}"]`);
        if (currentLine) currentLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function toLrcString() {
        const lines: string[] = [];

        for (const [index, timeStamp] of timeData) {
            const text = content.split('\n')[index] || '';
            lines.push(`[${formatDuration(timeStamp, 'mm:ss.S')}]${text}`);
        }

        return lines.join('\n');
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

<svelte:window
    onkeypress={event => {
        if (['TEXTAREA', 'INPUT'].includes(document.activeElement?.tagName || '')) return;

        event.preventDefault();

        if (paused) {
            audio.play();
        } else {
            audio.pause();
        }
    }}
/>

<audio
    src={audioURL}
    bind:this={audio}
    preload="auto"
    crossorigin="anonymous"
    class="w-full"
    loop
></audio>

<main class="p-5 pb-20 w-full flex flex-col">
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
        <form
            use:enhance
            method="POST"
            action={
                resolve(
                    '/(app)/release/[releaseId]/edit/track/[trackId]/lyrics',
                    { releaseId: page.params.releaseId!, trackId: page.params.trackId! }
                ) + '?/edit'
            }
            class="pb-10"
        >
            {#if !isTouchUI.current}
                <Tabs bind:value={currentView} class="w-full">
                    <TabsContent value="editor">
                        <Label class="text-xl font-semibold mb-4 text-center block">
                            Synced Editor
                        </Label>
                        <LyricsEditor
                            bind:currentTime={
                                () => currentTime,
                                value => audio.currentTime = value
                            }
                            bind:lyrics={content}
                            bind:currentLyricIndex
                            {timeData}
                        />
                    </TabsContent>
                    <TabsContent value="raw" class="h-full">
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
            {:else}
                <section class="flex w-full gap-2">
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
                            bind:currentLyricIndex
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
            {/if}
        </form>
    {/if}
</main>

<section class="fixed bottom-16 sm:bottom-0 left-0 select-none flex flex-col items-center w-full pointer-events-none gap-2">
    {#if currentView === 'editor'}
        <div class="flex md:hidden gap-1 w-full container justify-center lg:px-7 px-5 [&_button]:pointer-events-auto">
            <Button variant="secondary" size="icon-lg" onclick={() => setCurrentLyricIndex(currentLyricIndex - 1)}>
                <ArrowUpIcon/>
            </Button>
            <Button variant="default" size="lg" onclick={() => setLyricTimestamp(currentLyricIndex, currentTime)}>
                <BetweenHorizontalEndIcon/>
                Update Timestamp
            </Button>
                <Button variant="secondary" size="icon-lg" onclick={() => setCurrentLyricIndex(currentLyricIndex + 1)}>
                    <ArrowDownIcon/>
                </Button>
        </div>
    {/if}
    <div class="flex items-center gap-1 rounded-md container pointer-events-auto pb-2 lg:px-7 px-5">
        <Button
            size="icon-lg"
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
        <div class="bg-muted h-10 px-3 rounded-full w-full flex items-center text-xs text-muted-foreground font-medium sticky top-2 left-0">
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
                    <Button {...props} variant="secondary" size="icon-lg">
                        <EllipsisVerticalIcon/>
                    </Button>
                {/snippet}
            </DropdownMenuTrigger>
            <DropdownMenuContent class="min-w-3xs font-medium" align="end">
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
                        <PencilLineIcon/>
                        Switch to Raw Lyrics
                    {:else}
                        <TimelineIcon/>
                        Switch to Synced Editor
                    {/if}
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem
                    disabled={!content.trim()}
                    onclick={() => {
                        const blob = new Blob([toLrcString()], { type: 'text/plain' });

                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${slug(track.name)}.lrc`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }}
                >
                    <DownloadIcon/>
                    Download .lrc
                </DropdownMenuItem>
                <DropdownMenuItem
                    class="text-primary"
                    aria-disabled={!content.trim() || $submitting || !!$allErrors.length}
                    onclick={() => form.submit()}
                >
                    <SaveIcon class="text-current"/>
                    Save Changes
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
</section>
