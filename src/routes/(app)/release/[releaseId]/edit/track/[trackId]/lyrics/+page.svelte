<script lang="ts">
    import { PressedKeys, StateHistory, useEventListener } from 'runed';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte.js';
    import { parseLyrics } from '$lib/helpers/lyrics';
    import LrcLyricsEditor from '$lib/components/shared/app/lyrics/editor/LrcLyricsEditor.svelte';
    import { onMount } from 'svelte';
    import RangeSlider from 'svelte-range-slider-pips';
    import { Button } from '$lib/components/ui/button';
    import { DeleteIcon, DownloadIcon, EllipsisVerticalIcon, LoaderCircleIcon, Music4Icon, PauseIcon, PlayIcon, RotateCcwIcon, RotateCwIcon, SaveIcon, TimerResetIcon } from '@lucide/svelte';
    import { formatDuration } from '$lib/helpers/utils.js';
    import LyricsUpload from '$lib/components/shared/app/lyrics/editor/LyricsUpload.svelte';
    import type { Snapshot } from './$types.js';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import Label from '$lib/components/ui/label/label.svelte';
    import { superForm } from 'sveltekit-superforms';
    import { zod4Client } from 'sveltekit-superforms/adapters';
    import { newLyricsSchema } from '$lib/schema/lyrics.js';
    import { toast } from 'svelte-sonner';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { slug } from 'github-slugger';
    import MediaPlayer from '$lib/components/shared/MediaPlayer.svelte';
    import type { LyricLine } from '@applemusic-like-lyrics/lyric';

    let { data } = $props();

    const audioPlayer = AudioPlayer.context.get();
    const pressedKeys = new PressedKeys();

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

    const { enhance, submitting, allErrors, form: formData, capture, restore, tainted } = form;

    let track = $derived(data.track);
    let audioURL: string = $derived(resolve('/(app)/api/track/[trackId]/audio', { trackId: track.id }));

    let audio: HTMLAudioElement = $state(null)!;
    let currentTime: number = $state(0);
    let paused: boolean = $state(true);
    let duration: number = $state(0);

    let lines: LineData[] = $state([]);
    let highlightedIndex: number = $state(0);

    let frameId: number = 0;

    const history = new StateHistory(
        () => lines,
        newLines => lines = newLines,
        { capacity: 200 }
    );

    useEventListener(() => audio, ['loadedmetadata', 'seeked'], () => currentTime = audio.currentTime);
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

        frameId = requestAnimationFrame(onFrame);

        return () => {
            audioPlayer.hidden = false;
            cancelAnimationFrame(frameId);
        };
    });

    function onFrame() {
        currentTime = audio?.currentTime ?? 0;

        frameId = requestAnimationFrame(onFrame);
    }

    function reset() {
        const lyrics = track.lyrics;

        if (lyrics && lyrics.format !== 'TXT') {
            lines = parseLyricLines(parseLyrics($formData) as LyricLine[]);
        } else {
            lines = lyrics ? lyrics.content.split('\n').map(text => ({ text })) : [];
        }

        history.clear();
    }

    function parseLyricLines(lines: LyricLine[]): LineData[] {
        return lines
            .map(l => {
                let text = l.words.map(w => w.word).join('');

                return {
                    text: l.isBG ? `(${text})` : text,
                    startTime: l.startTime / 1000
                };
            })
            .sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0));
    }

    function clear() {
        lines = [];
        history.clear();
    }

    function downloadContent() {
        const blob = new Blob([$formData.content], { type: 'text/plain' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${slug(track.name)}.lrc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    type LogEvent<T> = {
        snapshot: T;
        timestamp: number;
    }

    type LineData = {
        text: string;
        startTime?: number;
    }

    export const snapshot: Snapshot<{
        lines: LineData[];
        history: LogEvent<LineData[]>[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form: any;
    }> = {
        capture: () => ({
            lines,
            history: history.log,
            form: capture()
        }),
        restore: snapshot => {
            restore(snapshot.form);

            lines = snapshot.lines;
            history.log = snapshot.history;
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

<MediaPlayer
    src={audioURL}
    bind:ref={audio}
    preload="auto"
    crossorigin="anonymous"
    class="w-full"
    type="audio"
    loop
/>

<main class="p-5 pb-20 w-full flex flex-col">
    {#if !lines.length}
        <div class="text-center text-muted-foreground min-h-[calc(100svh-16rem)] flex items-center justify-center">
            <LyricsUpload
                onParse={(data) => {
                    lines = data.format !== 'TXT'
                        ? parseLyricLines(data.lines)
                        : data.content.split('\n').map(text => ({ text }));

                    $formData.format = data.format;
                    $formData.content = data.content;

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
            {#if $formData.format !== 'TTML'}
                <section class="w-full gap-2">
                    <Label class="text-xl font-semibold mb-4">
                        Lyrics Editor
                    </Label>
                    <LrcLyricsEditor
                        bind:currentTime={
                            () => currentTime,
                            value => audio.currentTime = value
                        }
                        bind:lines
                        bind:highlightedIndex
                        {form}
                    />
                </section>
            {:else}
                <div class="text-center text-muted-foreground min-h-[calc(100svh-16rem)] flex flex-col items-center justify-center gap-4">
                    <Label>
                        Editing TTML lyrics is not supported yet.
                    </Label>
                    <Button type="submit">
                        {#if $submitting}
                            <LoaderCircleIcon class="animate-spin text-current"/>
                        {:else}
                            <SaveIcon class="text-current"/>
                            <span>Save</span>
                        {/if}
                    </Button>
                </div>
            {/if}
        </form>
    {/if}
</main>

<section class="fixed bottom-16 sm:bottom-0 left-0 select-none flex flex-col items-center w-full pointer-events-none gap-2">
    <div class="flex items-center gap-1 rounded-md container pointer-events-auto pb-2 lg:px-7 px-5">
        <Button
            size="icon-lg"
            variant="default"
            class="[&>svg]:fill-current"
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
                on:stop={e => audio.currentTime = e.detail.value}
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
                    disabled={!lines.length}
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
                <DropdownMenuSeparator/>
                <DropdownMenuItem
                    disabled={!lines.length}
                >
                    {#snippet child({ props })}
                        <a {...props} href={resolve('/(app)/release/[releaseId]/track/[trackId]', { releaseId: page.params.releaseId!, trackId: page.params.trackId! })}>
                            <Music4Icon/>
                            View Track
                        </a>
                    {/snippet}
                </DropdownMenuItem>
                <DropdownMenuItem
                    disabled={!lines.length}
                    onclick={downloadContent}
                    class="md:hidden"
                >
                    <DownloadIcon/>
                    Download .lrc
                </DropdownMenuItem>
                <DropdownMenuItem
                    class="text-primary md:hidden"
                    aria-disabled={!lines.length || $submitting || !!$allErrors.length}
                    onclick={() => form.submit()}
                    closeOnSelect={false}
                >
                    {#if $submitting}
                        <LoaderCircleIcon class="animate-spin text-current"/>
                    {:else}
                        <SaveIcon class="text-current"/>
                    {/if}
                    Save Changes
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <Button
            variant="secondary"
            size="icon-lg"
            class="hidden md:inline-flex"
            onclick={downloadContent}
        >
            <DownloadIcon/>
        </Button>
        <Button
            variant="default" size="lg"
            class={[
                "hidden md:inline-flex size-10",
                $tainted && "w-fit"
            ]}
            aria-disabled={!lines.length || $submitting || !!$allErrors.length}
            onclick={() => form.submit()}
        >
            {#if $submitting}
                <LoaderCircleIcon class="animate-spin text-current"/>
            {:else}
                <SaveIcon class="text-current"/>
                {#if $tainted}
                    <span>Save</span>
                {/if}
            {/if}
        </Button>
    </div>
</section>
