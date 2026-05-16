<script lang="ts">
    import { AspectRatio } from '$lib/components/ui/aspect-ratio';
    import { Button } from '$lib/components/ui/button';
    import { ChevronDown, ListMusicIcon, Maximize2Icon, MessageSquareQuoteIcon, Minimize2Icon, XIcon } from '@lucide/svelte';
    import { cn, formatDuration } from '$lib/helpers/utils';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { MediaQuery } from 'svelte/reactivity';
    import { PressedKeys } from 'runed';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import PlayerTitleItem from '$lib/components/shared/app/player/PlayerTitleItem.svelte';
    import { PlayerLastNavigate } from '$lib/contexts/player';
    import PlayerProgressBar from '$lib/components/shared/app/player/PlayerProgressBar.svelte';
    import PlayerControls from '$lib/components/shared/app/player/PlayerControls.svelte';
    import LyricsViewport from '$lib/components/shared/app/lyrics/LyricsViewport.svelte';
    import { parseLyrics } from '$lib/helpers/lyrics';

    const audioPlayer = AudioPlayer.context.get();
    const playerLastNavigate = PlayerLastNavigate.get();
    const isLargeWindow = new MediaQuery('(width >= 900px)');
    const keysPressed = new PressedKeys();

    let isLyricsEnabled = $derived(!!audioPlayer.lyrics.current);
    let isFullscreen = $state(false);

    keysPressed.onKeys(['Escape'], async () => {
        if (document.fullscreenElement != null) {
            await document.exitFullscreen();
            return;
        }

        exitPlayer();
    });

    function exitPlayer() {
        if (document.fullscreenElement != null) {
            document.exitFullscreen();
        }

        if (playerLastNavigate.path) {
            // eslint-disable-next-line svelte/no-navigation-without-resolve
            goto(playerLastNavigate.path);
        } else if (audioPlayer.currentTrack) {
            goto(resolve('/(app)/release/[releaseId]', { releaseId: audioPlayer.currentTrack.releaseId }));
        } else {
            goto(resolve('/(app)/home'));
        }
    }

    async function toggleFullscreen() {
        if (document.fullscreenElement != null) {
            await document.exitFullscreen();
        } else {
            await document.documentElement.requestFullscreen({
                navigationUI: 'hide'
            });
        }
    }
</script>

<svelte:window
    onfullscreenchange={() => isFullscreen = document.fullscreenElement != null}
    onpopstate={async () => {
        if (document.fullscreenElement != null) {
            await document.exitFullscreen();
        }
    }}
/>

<main class="flex size-full items-center-safe justify-evenly relative gap-2 text-white! dark select-none">
    <div class="max-w-lg min-[900px]:max-w-md lg:max-w-lg w-full min-[900px]:h-fit h-full flex flex-col justify-between px-6 min-[900px]:py-14 shrink-0">
        <header class="min-[900px]:fixed min-[900px]:px-5 z-10 top-0 left-0 flex w-full h-fit items-center justify-between gap-2 pt-4 pb-0">
            <Button
                variant="ghost"
                size="icon-lg"
                class="shadow-none min-[900px]:bg-white/10!"
                onclick={exitPlayer}
            >
                <XIcon class="size-5 hidden min-[900px]:inline"/>
                <ChevronDown class="size-8 stroke-1 mt-1 min-[900px]:hidden"/>
            </Button>
            <a
                class="text-sm text-center leading-tight min-[900px]:hidden w-full"
                href={
                    audioPlayer.releaseInfo.current
                        ? resolve('/(app)/release/[releaseId]', { releaseId: audioPlayer.releaseInfo.current.id })
                        : '#/'
                }
            >
                <span class="text-xs text-foreground/70">NOW PLAYING FROM</span>
                <p class="font-semibold line-clamp-1 truncate text-balance">
                    {audioPlayer.releaseInfo.current?.name || 'Unknown Track'}
                </p>
            </a>
            <div class="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon-lg"
                    class={cn(
                        "invisible shadow-none min-[900px]:visible bg-white/10!",
                        isFullscreen && 'bg-white/80! text-black!'
                    )}
                    onclick={toggleFullscreen}
                >
                    {#if isFullscreen}
                        <Minimize2Icon class="size-5"/>
                    {:else}
                        <Maximize2Icon class="size-5"/>
                    {/if}
                </Button>
            </div>
        </header>
        <section class="flex flex-col gap-0 pt-4">
            <AspectRatio
                class={cn(
                    "w-full rounded-md shadow-lg overflow-hidden transition-transform ease-in-out duration-300",
                    audioPlayer.paused && "scale-95"
                )}
            >
                <img
                    src={audioPlayer.coverURL}
                    alt="Release Cover"
                    class="now-cover size-full object-cover"
                />
            </AspectRatio>
            <PlayerTitleItem class="py-6 px-0"/>
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
        <footer class="flex min-[900px]:fixed z-10 bottom-0 right-0 items-center justify-evenly min-[900px]:px-4 py-4 gap-2">
            <Button
                variant="secondary"
                size={isLargeWindow.current ? "icon-lg" : "default"}
                class={cn(
                    "bg-white/10! shadow-none",
                    !audioPlayer.lyrics.current && "hidden",
                    isLyricsEnabled && isLargeWindow.current && 'bg-white/80! text-black!'
                )}
                onclick={
                    () => !isLargeWindow.current
                        ? goto(resolve('/(player)/lyrics'))
                        : isLyricsEnabled = !isLyricsEnabled
                }
            >
                <MessageSquareQuoteIcon class="min-[900px]:size-6 size-4"/>
                <span class="min-[900px]:hidden">Lyrics</span>
            </Button>
            <Button
                variant="secondary"
                size={isLargeWindow.current ? "icon-lg" : "default"}
                class="bg-white/10! shadow-none"
            >
                <ListMusicIcon class="min-[900px]:size-6 size-4"/>
                <span class="min-[900px]:hidden">Queue</span>
            </Button>
        </footer>
    </div>
    {#if isLyricsEnabled && !audioPlayer.lyrics.loading && audioPlayer.lyrics.current}
        <div class="max-w-3xl size-full hidden min-[900px]:flex justify-center items-center-safe p-6">
            <LyricsViewport
                currentTime={audioPlayer.currentTime}
                lyrics={audioPlayer.lyrics.current ? parseLyrics(audioPlayer.lyrics.current) : []}
                setCurrentTime={(time) => audioPlayer.seek(time)}
                scrollBlock="center"
                class="text-4xl lg:text-5xl font-bold leading-snug mask-t-from-80% mask-t-to-100% mask-b-from-80% mask-b-to-100%"
                containerClass="pt-[50svh]"
            />
        </div>
    {/if}
</main>
