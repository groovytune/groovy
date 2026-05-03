<script lang="ts">
    import { AudioPlayerContext } from '$lib/contexts/player';
    import { FastAverageColor, type FastAverageColorResult } from 'fast-average-color';
    import { untrack } from 'svelte';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio';
    import { Button } from '$lib/components/ui/button';
    import { ChevronDown, EllipsisIcon, HeartIcon, LoaderIcon, PauseIcon, PlayIcon, Repeat1Icon, RepeatIcon, ShuffleIcon, SkipBackIcon, SkipForwardIcon } from '@lucide/svelte';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '$lib/components/ui/item';
    import RangeSlider from 'svelte-range-slider-pips';
    import { cn, formatDuration } from '$lib/helpers/utils';
    import ExplicitIcon from '$lib/components/shared/icons/ExplicitIcon.svelte';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { fade } from 'svelte/transition';

    const audioPlayer = AudioPlayerContext.get();

    let averageColor: FastAverageColorResult|null = $state(null);
    let disableBlurBackground = $state(false);

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
</script>

<main
    class="player-view flex flex-col size-full items-center justify-start relative gap-2 text-white! dark"
    style={(averageColor ? `--average-color: ${averageColor.hex};` : '')}
>
    <header class="max-w-lg w-full flex items-center justify-between pt-4 pb-0 px-6">
        <Button
            variant="ghost"
            size="icon-lg"
            class="shadow-none"
            onclick={
                () => window.history.length
                    ? window.history.back()
                    : goto(resolve('/(app)/release/[id]', { id: audioPlayer.currentTrack?.releaseId ?? '' }))
            }
        >
            <ChevronDown class="size-8 stroke-1 mt-1"/>
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
        <Button variant="ghost" size="icon-lg" class="invisible"/>
    </header>
    <section class="max-w-lg w-full flex flex-col gap-8 py-4 px-6">
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
    <footer class="max-w-lg w-full flex items-center justify-center pt-4 px-6 gap-2">
        <Button variant="outline" size="lg">
            Lyrics
        </Button>
        <Button variant="outline" size="lg">
            Queue
        </Button>
        <Button variant="outline" size="lg" onclick={() => disableBlurBackground = !disableBlurBackground}>
            Blur Bg
        </Button>
    </footer>
</main>

<div class="fixed -z-10 top-0 left-0 size-full">
    <div class="size-full absolute top-0 left-0 backdrop-blur-3xl backdrop-saturate-200 bg-black/50 z-10"></div>
    {#if !disableBlurBackground}
        {#key audioPlayer.coverURL}
            <img transition:fade src={audioPlayer.coverURL} alt="Release Cover" class="absolute top-0 left-0 size-full object-cover"/>
        {/key}
    {/if}
    <div class="size-full" style={averageColor ? `background-color: ${averageColor.hex};` : undefined}></div>
</div>
