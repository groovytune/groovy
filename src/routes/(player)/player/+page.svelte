<script lang="ts">
    import { AudioPlayerContext } from '$lib/contexts/player';
    import { FastAverageColor, type FastAverageColorResult } from 'fast-average-color';
    import { untrack } from 'svelte';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio';
    import { Button } from '$lib/components/ui/button';
    import { EllipsisIcon, HeartIcon, LoaderIcon, PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from '@lucide/svelte';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '../../../lib/components/ui/item';
    import RangeSlider from 'svelte-range-slider-pips';
    import { cn, formatDuration } from '../../../lib/helpers/utils';

    const audioPlayer = AudioPlayerContext.get();

    let averageColor: FastAverageColorResult|null = $state(null);
    let disableBlurBackground = $state(false);

    $effect(() => {
        const fac = new FastAverageColor();

        const color = disableBlurBackground
            ? fac
                .getColorAsync(audioPlayer.coverURL, {
                    mode: 'speed',
                    algorithm: 'simple'
                })
                .catch(() => null)
            : Promise.resolve(null);

        untrack(() => color.then(res => averageColor = res));
    });
</script>

<main
    class={cn(
        "flex size-full items-center-safe justify-center relative",
        averageColor && disableBlurBackground
            ? [
                "bg-(--average-color)",
                averageColor.isDark ? 'text-white dark' : 'text-black'
            ]
            : 'text-white dark'
    )}
    style={averageColor ? `--average-color: ${averageColor.hex};` : undefined}
>
    <section class="max-w-lg w-full flex flex-col gap-8 p-4 sm:p-8">
        <AspectRatio
            class="w-full rounded-md bg-muted"
        >
            <img src={audioPlayer.coverURL} alt="Release Cover" class="size-full object-cover rounded-md"/>
            <img src={audioPlayer.coverURL} alt="Release Cover" class="size-full object-cover absolute -z-10 top-0 left-0 opacity-50 saturate-150 blur-2xl"/>
        </AspectRatio>
        <Item class="p-0">
            <ItemContent class="gap-0">
                <ItemTitle class="text-lg sm:text-xl leading-tight font-semibold line-clamp-3" style="word-wrap: break-word;">
                    {audioPlayer.currentTrack?.name || 'Unknown Track'}
                </ItemTitle>
                <ItemDescription class="text-sm leading-tight text-muted-foreground">
                    {audioPlayer.releaseInfo.current?.user.name || 'Unknown Artist'}
                </ItemDescription>
            </ItemContent>
            <ItemActions>
                <Button variant="secondary" size="icon" class="bg-white/10!">
                    <HeartIcon/>
                </Button>
                <Button variant="secondary" size="icon" class="bg-white/10!">
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
            <div class="flex justify-between">
                <span class="w-6 text-start">{audioPlayer.currentTrack ? formatDuration(audioPlayer.currentTime || 0) : '--:--'}</span>
                <span class="w-6 text-end">{audioPlayer.currentTrack ? formatDuration(audioPlayer.duration || 0) : '--:--'}</span>
            </div>
        </div>
        <div class="text-center">
            <Button variant="ghost" size="icon-lg" class="size-18 [&_svg]:size-6! bg-transparent!" disabled={!audioPlayer.previousable} onclick={() => audioPlayer.previous()}>
                <SkipBackIcon fill="currentColor"/>
            </Button>
            <Button variant="secondary" size="icon-lg" class="size-18 [&_svg]:size-6! bg-white/20!" disabled={!audioPlayer.currentTrack} onclick={() => audioPlayer.togglePlay()}>
                {#if audioPlayer.status == 'buffering'}
                    <LoaderIcon class="animate-spin"/>
                {:else if audioPlayer.paused}
                    <PlayIcon fill="currentColor"/>
                {:else}
                    <PauseIcon fill="currentColor"/>
                {/if}
            </Button>
            <Button variant="ghost" size="icon-lg" class="size-18 [&_svg]:size-6! bg-transparent!" disabled={!audioPlayer.skippable} onclick={() => audioPlayer.next()}>
                <SkipForwardIcon fill="currentColor"/>
            </Button>
        </div>
    </section>
</main>

{#if !disableBlurBackground}
    <div class="fixed -z-10 top-0 left-0 size-full">
        <div class="size-full absolute top-0 left-0 backdrop-blur-3xl backdrop-saturate-200 bg-black/50"></div>
        <img src={audioPlayer.coverURL} alt="Release Cover" class="size-full object-cover"/>
    </div>
{/if}
