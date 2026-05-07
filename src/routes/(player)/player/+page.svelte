<script lang="ts">
    import { FastAverageColor, type FastAverageColorResult } from 'fast-average-color';
    import { untrack } from 'svelte';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio';
    import { Button } from '$lib/components/ui/button';
    import { ChevronDown, EllipsisIcon, HeartIcon, ListMusicIcon, LoaderIcon, Maximize2Icon, MessageSquareQuoteIcon, Minimize2Icon, PauseIcon, PlayIcon, Repeat1Icon, RepeatIcon, ShuffleIcon, SkipBackIcon, SkipForwardIcon, XIcon } from '@lucide/svelte';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '$lib/components/ui/item';
    import RangeSlider from 'svelte-range-slider-pips';
    import { cn, formatDuration } from '$lib/helpers/utils';
    import ExplicitIcon from '$lib/components/shared/icons/ExplicitIcon.svelte';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { MediaQuery } from 'svelte/reactivity';
    import { ScrollArea } from '$lib/components/ui/scroll-area';
    import PlayerGradientBackground from '$lib/components/shared/app/player/PlayerGradientBackground.svelte';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import { PressedKeys } from 'runed';
    import { fade } from 'svelte/transition';
    import { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import PlayerQueueDialog from '$lib/components/shared/app/player/PlayerQueueDialog.svelte';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';

    const audioPlayer = AudioPlayer.context.get();
    const isLargeWindow = new MediaQuery('(width >= 900px)');
    const keysPressed = new PressedKeys();
    const queueDialogState = new DialogState({ id: 'queue' });

    let averageColor: FastAverageColorResult|null = $state(null);

    let isLyricsEnabled = $state(false);
    let isFullscreen = $state(false);
    let isMeshGradientEnabled = $state(true);

    let backing = false;
    let coverAPIURL = $derived(
        audioPlayer.currentTrack
            ? resolve('/(app)/api/track/[id]/cover', { id: audioPlayer.currentTrack?.id ?? '' }) + '?size=300'
            : coverPlaceholder
    );

    $effect(() => {
        const fac = new FastAverageColor();

        const color = coverPlaceholder !== coverAPIURL
            ? fac.getColorAsync(coverAPIURL, {
                mode: 'speed',
                algorithm: 'simple'
            }).catch(() => null)
            : null;

        untrack(() => color?.then(res => averageColor = res));
    });

    keysPressed.onKeys(['Escape'], async () => {
        if (document.fullscreenElement != null) {
            await document.exitFullscreen();
            return;
        }

        onBack();
    });

    function onBack() {
        if (backing) return;

        backing = true;

        if (window.history.length > 1) {
            window.history.back();
        } else if (audioPlayer.currentTrack) {
            goto(resolve('/(app)/release/[id]', { id: audioPlayer.currentTrack.releaseId }));
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

<main
    class="flex size-full items-center-safe justify-evenly relative gap-2 text-white! dark select-none"
    style={(averageColor ? `--average-color: ${averageColor.hex};` : '')}
>
    <div class="max-w-lg min-[900px]:max-w-md lg:max-w-lg w-full min-[900px]:h-fit h-full flex flex-col justify-between px-6 min-[900px]:py-14 shrink-0">
        <header class="min-[900px]:fixed min-[900px]:px-5 z-10 top-0 left-0 flex w-full h-fit items-center justify-between gap-2 pt-4 pb-0">
            <Button
                variant="ghost"
                size="icon-lg"
                class="shadow-none min-[900px]:bg-white/10!"
                onclick={onBack}
            >
                <XIcon class="size-5 hidden min-[900px]:inline"/>
                <ChevronDown class="size-8 stroke-1 mt-1 min-[900px]:hidden"/>
            </Button>
            <a
                class="text-sm text-center leading-tight min-[900px]:hidden w-full"
                href={
                    audioPlayer.releaseInfo.current
                        ? resolve('/(app)/release/[id]', { id: audioPlayer.releaseInfo.current.id })
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
                class="w-full rounded-md shadow-lg overflow-hidden"
            >
                <img
                    src={audioPlayer.coverURL}
                    alt="Release Cover"
                    class="now-cover size-full object-cover"
                />
            </AspectRatio>
            <Item class="py-6 px-0">
                <ItemContent class="gap-0">
                    <ItemTitle class="now-title text-lg sm:text-xl leading-tight font-semibold line-clamp-3">
                        <!-- svelte-ignore a11y_distracting_elements -->
                        <marquee behavior="alternate" direction="vertical" scrollamount="1">
                            {audioPlayer.currentTrack?.name || 'Unknown Track'}
                            {#if audioPlayer.currentTrack?.explicit}
                                <ExplicitIcon class="size-5"/>
                            {/if}
                        </marquee>
                    </ItemTitle>
                    <ItemDescription class="now-artist text-sm font-medium leading-tight text-foreground/80">
                        <!-- svelte-ignore a11y_distracting_elements -->
                        <marquee behavior="alternate" direction="vertical" scrollamount="1" class="w-fit">
                            {audioPlayer.artistInfo.current?.name || 'Unknown Artist'}
                        </marquee>
                    </ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Button variant="secondary" size="icon" class="bg-white/10! shadow-none">
                        <HeartIcon/>
                    </Button>
                    <Button variant="secondary" size="icon" class="bg-white/10! shadow-none">
                        <EllipsisIcon/>
                    </Button>
                </ItemActions>
            </Item>
            <div class="grid w-full gap-2 text-xs text-muted-foreground">
                <RangeSlider
                    on:start={() => audioPlayer.pause()}
                    on:stop={() => audioPlayer.play()}
                    on:change={(e) => audioPlayer.seek(e.detail.value)}
                    bind:value={audioPlayer.currentTime}
                    step={0.5}
                    range="min"
                    min={0}
                    max={audioPlayer.duration || 0.1}
                    springValues={{ stiffness: 0.3, damping: 0.9 }}
                    disabled={!audioPlayer.currentTrack}
                    class="m-0! w-full mono"
                />
                <div class="flex justify-between font-medium text-white/60">
                    <span class="w-6 text-start">{audioPlayer.currentTrack ? formatDuration(audioPlayer.currentTime || 0) : '--:--'}</span>
                    <span class="w-6 text-end">{audioPlayer.currentTrack ? formatDuration(audioPlayer.duration || 0) : '--:--'}</span>
                </div>
            </div>
            <div class="flex justify-around items-center">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    class="bg-transparent! shadow-none"
                    onclick={() => isMeshGradientEnabled = !isMeshGradientEnabled}
                >
                    <ShuffleIcon/>
                </Button>
                <Button
                    variant="ghost"
                    size="icon-lg"
                    class="size-18 bg-transparent! shadow-none"
                    disabled={!audioPlayer.previousable}
                    onclick={() => audioPlayer.previous()}
                >
                    <SkipBackIcon fill="currentColor" class="size-6"/>
                </Button>
                <Button
                    variant="secondary"
                    size="icon-lg"
                    class="size-18 bg-white/20! shadow-none"
                    disabled={!audioPlayer.currentTrack}
                    onclick={() => audioPlayer.togglePlay()}
                >
                    {#if audioPlayer.status == 'buffering'}
                        <LoaderIcon class="animate-spin size-6"/>
                    {:else if audioPlayer.paused}
                        <PlayIcon fill="currentColor" class="size-6"/>
                    {:else}
                        <PauseIcon fill="currentColor" class="size-6"/>
                    {/if}
                </Button>
                <Button
                    variant="ghost"
                    size="icon-lg"
                    class="size-18 bg-transparent! shadow-none"
                    disabled={!audioPlayer.skippable}
                    onclick={() => audioPlayer.next()}
                >
                    <SkipForwardIcon class="size-6" fill="currentColor"/>
                </Button>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    class={cn(
                        "bg-transparent! shadow-none",
                        audioPlayer.repeat != 'none' && 'bg-white/80! text-black!'
                    )}
                    onclick={() => audioPlayer.toggleRepeat()}
                >
                    {#if audioPlayer.repeat == 'one'}
                        <Repeat1Icon/>
                    {:else}
                        <RepeatIcon/>
                    {/if}
                </Button>
            </div>
        </section>
        <footer class="flex min-[900px]:fixed z-10 bottom-0 right-0 items-center justify-evenly min-[900px]:px-4 py-4 gap-2">
            <Button
                variant="secondary"
                size={isLargeWindow.current ? "icon-lg" : "default"}
                class={cn(
                    "bg-white/10! shadow-none",
                    !isLyricsEnabled && 'bg-white/80! text-black!'
                )}
                onclick={() => isLyricsEnabled = !isLyricsEnabled}
            >
                <MessageSquareQuoteIcon class="min-[900px]:size-6 size-4"/>
                <span class="min-[900px]:hidden">Lyrics</span>
            </Button>
            <Button
                variant="secondary"
                size={isLargeWindow.current ? "icon-lg" : "default"}
                class="bg-white/10! shadow-none"
                onclick={() => queueDialogState.open()}
            >
                <ListMusicIcon class="min-[900px]:size-6 size-4"/>
                <span class="min-[900px]:hidden">Queue</span>
            </Button>
        </footer>
    </div>
    {#if !isLyricsEnabled}
        <div class="max-w-3xl size-full hidden min-[900px]:flex justify-center items-center-safe p-6">
            <!-- TODO: Implement lyrics display -->
            <ScrollArea class="size-full text-4xl lg:text-5xl font-bold leading-snug mask-t-from-80% mask-t-to-100% mask-b-from-80% mask-b-to-100%">
                <div class="h-[40svh]"></div>
                <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
                {#each { length: 50 } as _, i (i)}
                    <p>Lorem ipsum dolor sit amet.</p>
                {/each}
            </ScrollArea>
        </div>
    {/if}
</main>

<div
    class="fixed -z-10 top-0 left-0 w-full h-full bg-(--average-color) transition-all duration-300"
    class:brightness-50={!isMeshGradientEnabled && averageColor?.isLight}
    style={`--average-color: ${averageColor?.hex ?? '#000000'};`}
>
    {#if isMeshGradientEnabled}
        <div out:fade class="size-full">
            <PlayerGradientBackground
                image={coverAPIURL}
                playing={!audioPlayer.paused}
            />
        </div>
    {/if}
</div>

<PlayerQueueDialog dialogState={queueDialogState} activeTab="queue"/>
