<script lang="ts">
    import { ListMusicIcon, LoaderIcon, PauseIcon, PlayIcon, Repeat1Icon, RepeatIcon, SkipBackIcon, SkipForwardIcon, Volume1Icon, Volume2Icon, VolumeXIcon } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
    import { Slider } from '$lib/components/ui/slider';
    import { AudioPlayerContext } from '$lib/contexts/player';
    import { formatDuration } from '$lib/helpers/utils';
    import { fly } from 'svelte/transition';
    import { resolve } from '$app/paths';
    import RangeSlider from 'svelte-range-slider-pips';
    import ExplicitIcon from '../../icons/ExplicitIcon.svelte';
    import { MediaQuery } from 'svelte/reactivity';

    const audioPlayer = AudioPlayerContext.get();
    const isMediumWidth = new MediaQuery('(width >= 48rem)');
</script>

{#if audioPlayer.currentTrack}
    <div
        in:fly={{ y: 100 }}
        out:fly={{ y: 100 }}
        class="fixed bottom-15 sm:bottom-0 left-0 sm:h-15 h-16 w-full flex justify-center z-50 sm:p-0 px-2 pb-2 sm:mb-2 select-none"
    >
        <div class="container flex items-center gap-2 lg:gap-5 p-2 bg-background/90 rounded-lg backdrop-blur-sm relative border">
            <div class="md:hidden absolute bottom-0 left-0 w-full h-0.5 rounded-lg px-2">
                <span class="block h-full bg-primary rounded-full" style="width: {audioPlayer.progress}%"></span>
            </div>
            <section class="flex items-center gap-2 w-full md:max-w-sm">
                <img src={audioPlayer.coverURL} alt="Cover Art" class="now-cover size-10 shrink-0 rounded-md overflow-hidden">
                <a
                    href={
                        audioPlayer.currentTrack
                            ? isMediumWidth.current
                                ? resolve('/(app)/release/[id]', { id: audioPlayer.currentTrack.releaseId })
                                : resolve('/(player)/player')
                            : undefined
                    }
                    class="flex flex-col leading-tight"
                >
                    <h3 class="now-title text-sm font-semibold line-clamp-1">
                        {#if audioPlayer.currentTrack}
                            {audioPlayer.currentTrack.name}
                            {#if audioPlayer.currentTrack.explicit}
                                <ExplicitIcon class="size-4.5"/>
                            {/if}
                        {:else}
                            <span class="text-muted-foreground">Not Playing</span>
                        {/if}
                    </h3>
                    <p class="now-artist text-xs text-muted-foreground line-clamp-1">
                        {#if audioPlayer.releaseInfo.current}
                            {audioPlayer.releaseInfo.current?.user.name} • {audioPlayer.releaseInfo.current?.name}
                        {/if}
                    </p>
                </a>
                <div class="shrink-0 flex items-center gap-1 ml-auto">
                    <Button variant="ghost" size="icon" disabled={!audioPlayer.previousable} onclick={() => audioPlayer.previous()}>
                        <SkipBackIcon fill="currentColor"/>
                    </Button>
                    <Button variant="default" size="icon" disabled={!audioPlayer.currentTrack} onclick={() => audioPlayer.togglePlay()}>
                        {#if audioPlayer.status == 'buffering'}
                            <LoaderIcon class="animate-spin"/>
                        {:else if audioPlayer.paused}
                            <PlayIcon fill="currentColor"/>
                        {:else}
                            <PauseIcon fill="currentColor"/>
                        {/if}
                    </Button>
                    <Button variant="ghost" size="icon" disabled={!audioPlayer.skippable} onclick={() => audioPlayer.next()}>
                        <SkipForwardIcon fill="currentColor"/>
                    </Button>
                </div>
            </section>
            <div class="items-center justify-between w-full hidden md:flex gap-2 text-xs text-muted-foreground">
                <span class="w-6 text-start">{audioPlayer.currentTrack ? formatDuration(audioPlayer.currentTime || 0) : '--:--'}</span>
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
                    class="m-0! w-[calc(100%-4rem)]"
                />
                <span class="w-6 text-end">{audioPlayer.currentTrack ? formatDuration(audioPlayer.duration || 0) : '--:--'}</span>
            </div>
            <div class="hidden md:flex gap-2">
                <Button variant="ghost" size="icon" class="ml-auto">
                    <ListMusicIcon/>
                </Button>
                <Button
                    variant={audioPlayer.repeat != 'none' ? "default" : "ghost"}
                    size="icon"
                    onclick={() => audioPlayer.toggleRepeat()}
                >
                    {#if audioPlayer.repeat == 'one'}
                        <Repeat1Icon/>
                    {:else}
                        <RepeatIcon/>
                    {/if}
                </Button>
                <Popover>
                    <PopoverTrigger>
                        {#snippet child({ props })}
                            <Button {...props} variant="ghost" size="icon">
                                {#if audioPlayer.volume > 0.5}
                                    <Volume2Icon/>
                                {:else if audioPlayer.volume > 0}
                                    <Volume1Icon/>
                                {:else}
                                    <VolumeXIcon/>
                                {/if}
                            </Button>
                        {/snippet}
                    </PopoverTrigger>
                    <PopoverContent class="w-fit p-2 flex overflow-hidden text-xs text-muted-foreground">
                        <Slider
                            type="single"
                            min={0}
                            max={1}
                            step={0.01}
                            bind:value={
                                () => audioPlayer.volume,
                                (v) => audioPlayer.setVolume(v)
                            }
                            orientation="vertical"
                            class="min-h-32! h-full"
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    </div>
{/if}
