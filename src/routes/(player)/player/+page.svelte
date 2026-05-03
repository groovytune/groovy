<script lang="ts">
    import { AudioPlayerContext } from '$lib/contexts/player';
    import { FastAverageColor, type FastAverageColorResult } from 'fast-average-color';
    import { untrack } from 'svelte';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio';
    import { Button } from '$lib/components/ui/button';
    import { ChevronDown, DropletIcon, DropletOffIcon, EllipsisIcon, HeartIcon, ListMusicIcon, LoaderIcon, MessageSquareQuoteIcon, PauseIcon, PlayIcon, Repeat1Icon, RepeatIcon, ShuffleIcon, SkipBackIcon, SkipForwardIcon, XIcon } from '@lucide/svelte';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '$lib/components/ui/item';
    import RangeSlider from 'svelte-range-slider-pips';
    import { cn, formatDuration } from '$lib/helpers/utils';
    import ExplicitIcon from '$lib/components/shared/icons/ExplicitIcon.svelte';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { fade } from 'svelte/transition';
    import { MediaQuery } from 'svelte/reactivity';

    const audioPlayer = AudioPlayerContext.get();
    const isLargeWindow = new MediaQuery('(width >= 64rem)');

    let averageColor: FastAverageColorResult|null = $state(null);
    let disableBlurBackground = $state(false);
    let disableLyrics = $state(false);

    $effect(() => {
        const fac = new FastAverageColor();

        const color = fac
            .getColorAsync(audioPlayer.coverURL, {
                mode: 'speed',
                algorithm: 'simple'
            })
            .catch(() => null);

        untrack(() => color.then(res => averageColor = res));
    });

    function onBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else if (audioPlayer.currentTrack) {
            goto(resolve('/(app)/release/[id]', { id: audioPlayer.currentTrack.releaseId }));
        } else {
            goto(resolve('/(app)/home'));
        }
    }
</script>

<main
    class="flex size-full items-center-safe justify-evenly relative gap-2 text-white! dark select-none"
    style={(averageColor ? `--average-color: ${averageColor.hex};` : '')}
>
    <div class="max-w-lg sm:max-w-sm md:max-w-md lg:max-w-lg w-full sm:h-fit h-full flex flex-col justify-between px-6 shrink-0">
        <header class="flex h-fit items-center justify-between pt-4 pb-0">
            <Button
                variant="ghost"
                size="icon-lg"
                class="shadow-none sm:bg-white/10!"
                onclick={onBack}
            >
                {#if isLargeWindow.current}
                    <XIcon class="size-8 stroke-1"/>
                {:else}
                    <ChevronDown class="size-8 stroke-1 mt-1"/>
                {/if}
            </Button>
            <div class="text-sm text-center leading-tight">
                <span class="text-xs text-muted-foreground">NOW PLAYING FROM</span>
                <p class="font-semibold">
                    <a
                        href={
                            audioPlayer.releaseInfo.current
                                ? resolve('/(app)/release/[id]', { id: audioPlayer.releaseInfo.current.id })
                                : '#/'
                        }
                    >
                        {audioPlayer.releaseInfo.current?.name || 'Unknown Track'}
                    </a>
                </p>
            </div>
            <Button variant="ghost" size="icon-lg" class="invisible shadow-none sm:visible bg-white/10!" onclick={() => disableLyrics = !disableLyrics}>
                <MessageSquareQuoteIcon class="size-6"/>
            </Button>
        </header>
        <section class="flex flex-col gap-8 py-4">
            <AspectRatio
                class="w-full rounded-md bg-muted"
            >
                <img src={audioPlayer.coverURL} alt="Release Cover" class="now-cover size-full object-cover rounded-md"/>
                <img src={audioPlayer.coverURL} alt="Release Cover" class="size-full object-cover absolute -z-10 top-0 left-0 opacity-50 saturate-150 blur-2xl"/>
            </AspectRatio>
            <Item class="p-0">
                <ItemContent class="gap-0">
                    <ItemTitle
                        class="now-title text-lg sm:text-xl leading-tight font-semibold line-clamp-3"
                        style="word-wrap: break-word;"
                    >
                        {audioPlayer.currentTrack?.name || 'Unknown Track'}
                        {#if audioPlayer.currentTrack?.explicit}
                            <ExplicitIcon class="size-5"/>
                        {/if}
                    </ItemTitle>
                    <ItemDescription class="now-artist text-sm font-medium leading-tight text-muted-foreground">
                        {audioPlayer.releaseInfo.current?.user.name || 'Unknown Artist'}
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
                <div class="flex justify-between font-semibold">
                    <span class="w-6 text-start">{audioPlayer.currentTrack ? formatDuration(audioPlayer.currentTime || 0) : '--:--'}</span>
                    <span class="w-6 text-end">{audioPlayer.currentTrack ? formatDuration(audioPlayer.duration || 0) : '--:--'}</span>
                </div>
            </div>
            <div class="flex justify-around items-center">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    class="bg-transparent! shadow-none"
                    onclick={() => audioPlayer.toggleRepeat()}
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
        <footer class="flex sm:hidden items-center justify-evenly py-4 gap-2">
            <Button variant="secondary" class="bg-white/10! shadow-none" onclick={() => disableLyrics = !disableLyrics}>
                <MessageSquareQuoteIcon class=""/>
                Lyrics
            </Button>
            <Button variant="secondary" class="bg-white/10! shadow-none" onclick={() => disableBlurBackground = !disableBlurBackground}>
                {#if disableBlurBackground}
                    <DropletIcon class=""/>
                {:else}
                    <DropletOffIcon class=""/>
                {/if}
                Backdrop
            </Button>
            <Button variant="secondary" class="bg-white/10! shadow-none">
                <ListMusicIcon class=""/>
                Queue
            </Button>
        </footer>
    </div>
    {#if !disableLyrics}
        <div class="max-w-xl size-full hidden sm:flex justify-center items-center-safe p-6">
            <!-- TODO: Implement lyrics display -->
            <p class="text-4xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-snug">
                Lyrics dapat dito
                <br>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Vero adipisci amet est ex voluptatum eos dolor quos blanditiis sint voluptate distinctio velit at nihil non labore itaque, fugiat neque voluptatibus.
            </p>
        </div>
    {/if}
</main>

<div class="fixed -z-10 top-0 left-0 size-full">
    <div class:backdrop-blur-3xl={!disableBlurBackground} class:backdrop-saturate-200={!disableBlurBackground} class="size-full absolute top-0 left-0 bg-black/50 z-10"></div>
    {#if !disableBlurBackground}
        {#key audioPlayer.coverURL}
            <img transition:fade src={audioPlayer.coverURL} alt="Release Cover" class="absolute top-0 left-0 size-full object-cover"/>
        {/key}
    {/if}
    <div class="size-full" style={averageColor ? `background-color: ${averageColor.hex};` : undefined}></div>
</div>
