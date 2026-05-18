<script lang="ts">
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import PlayerTitleItem from '$lib/components/shared/app/player/PlayerTitleItem.svelte';
    import PlayerProgressBar from '$lib/components/shared/app/player/PlayerProgressBar.svelte';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import { cn, formatDuration } from '$lib/helpers/utils';
    import { fade } from 'svelte/transition';
    import { useDebounce, useEventListener } from 'runed';
    import PlayerControls from '$lib/components/shared/app/player/PlayerControls.svelte';
    import LyricsViewport from '$lib/components/shared/app/lyrics/LyricsViewport.svelte';
    import { parseLyrics } from '$lib/helpers/lyrics';

    const audioPlayer = AudioPlayer.context.get();

    let scrolling = $state(false);
    let scrollContainer: HTMLElement|null = $state(null);

    const setNotScrolling = useDebounce(() => {
        scrolling = false;
    }, 1000);

    useEventListener(() => scrollContainer, 'touchstart', () => {
        scrolling = true;
    });

    useEventListener(() => scrollContainer, ['touchmove', 'wheel', 'mouseover'], () => {
        scrolling = true;
        setNotScrolling();
    });

    useEventListener(() => scrollContainer, ['touchend', 'mouseout'], () => {
        setNotScrolling();
    });
</script>

<main class="flex size-full justify-center relative gap-2 text-white! dark select-none">
    <div class="h-full w-full max-w-xl flex flex-col py-6 relative">
        <PlayerTitleItem
            class="px-6 py-0 shrink-0"
            titleClassName="text-sm! mt-2"
            artistClassName="text-xs! font-medium"
            cover={true}
            addReleaseName={true}
            oncoverclick={() => goto(resolve('/(player)/player'))}
        />
        {#if audioPlayer.lyrics.loading}
            <div
                bind:this={scrollContainer}
                class="h-full pb-32 flex items-center justify-center"
            >
                <p class="text-xl text-center text-white/50">
                    Loading lyrics...
                </p>
            </div>
        {:else if !audioPlayer.lyrics.current}
            <div
                bind:this={scrollContainer}
                class="h-full pb-32 flex items-center justify-center"
            >
                <p class="text-xl text-center text-white/50">
                    No lyrics found for this track.
                </p>
            </div>
        {:else}
            <LyricsViewport
                bind:ref={scrollContainer}
                currentTime={audioPlayer.currentTime}
                lyrics={audioPlayer.lyrics.current && !audioPlayer.lyrics.loading ? parseLyrics(audioPlayer.lyrics.current) : []}
                setCurrentTime={(time) => audioPlayer.seek(time)}
                scrollBlock="start"
                class={cn(
                    "transition-[mask] duration-500 ease-in-out",
                    "h-[calc(100%-2.6rem)] text-3xl font-bold leading-snug mask-t-from-90% mask-t-to-100% mask-b-from-80% mask-b-to-100%",
                    (scrolling || audioPlayer.paused) && "mask-b-from-60% mask-b-to-80%"
                )}
            />
        {/if}
        {#if scrolling || audioPlayer.paused || audioPlayer.lyrics.loading || !audioPlayer.lyrics.current}
            <section transition:fade={{ duration: 500 }} class="absolute bottom-5 left-0 w-full p-6">
                <div class="grid w-full gap-2 text-xs text-muted-foreground">
                    <PlayerProgressBar class="mono"/>
                    <div class="flex justify-between font-medium text-white/60">
                        <span class="w-6 text-start">{audioPlayer.currentTrack ? formatDuration(audioPlayer.currentTime || 0) : '--:--'}</span>
                        <span class="w-6 text-end">{audioPlayer.currentTrack ? formatDuration(audioPlayer.duration || 0) : '--:--'}</span>
                    </div>
                </div>
                <div class="flex justify-around items-center">
                    <PlayerControls/>
                </div>
            </section>
        {/if}
    </div>
</main>
