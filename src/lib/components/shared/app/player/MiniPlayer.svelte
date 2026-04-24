<script lang="ts">
    import coverPlaceholder from '$lib/assets/cover.webp';
    import { FastForwardIcon, ListMusicIcon, LoaderIcon, PauseIcon, PlayIcon, Repeat1Icon, RepeatIcon, RewindIcon, Volume1Icon, Volume2Icon, VolumeXIcon } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
    import { Slider } from '$lib/components/ui/slider';
    import { AudioPlayerContext } from '$lib/contexts/player';
    import { formatDuration } from '$lib/helpers/utils';
    import { Appwrite } from '$lib/client/appwrite';
    import { ImageGravity } from 'appwrite';
    import RangeSlider from 'svelte-range-slider-pips';
    import { fly } from 'svelte/transition';
    import { resource } from 'runed';
    import type { GETResponse } from '../../../../../routes/(app)/api/release/[id]/+server';
    import { resolve } from '$app/paths';

    const audioPlayer = AudioPlayerContext.get();

    const releaseInfo = resource(
        () => audioPlayer.currentTrack?.releaseId,
        async (releaseId): Promise<GETResponse|null> => {
            if (!releaseId) return null;

            const response = await fetch(resolve('/(app)/api/release/[id]', { id: releaseId }));
            return response.json();
        }
    );

    let coverURL = $derived(
        audioPlayer.currentTrack?.cover || releaseInfo.current?.cover
            ? Appwrite.storage.getFilePreview({
                bucketId: 'image',
                fileId: (audioPlayer.currentTrack?.cover || releaseInfo.current?.cover)!,
                height: 100,
                width: 100,
                gravity: ImageGravity.Center
            })
            : coverPlaceholder
    );

    function toggleRepeat() {
        switch (audioPlayer.repeat) {
            case 'none':
                audioPlayer.repeat = 'all';
                break;
            case 'all':
                audioPlayer.repeat = 'one';
                break;
            case 'one':
                audioPlayer.repeat = 'none';
                break;
        }
    }
</script>

{#if audioPlayer.currentTrack}
    <div
        in:fly={{ y: 100 }}
        out:fly={{ y: 100 }}
        class="fixed bottom-15 sm:bottom-0 left-0 sm:h-15 h-16 w-full sm:bg-background sm:border-t flex justify-center z-50 sm:p-0 px-2 pb-2"
    >
        <div class="container flex items-center gap-2 lg:gap-5 p-2 sm:px-5 sm:bg-transparent bg-background/90 rounded-lg backdrop-blur-sm sm:backdrop-blur-0 border sm:border-0 lg:max-w-6xl relative">
            <div class="md:hidden absolute bottom-0 left-0 w-full h-0.5 rounded-lg px-2">
                <div class="h-full bg-primary rounded-full" style="width: {audioPlayer.progress}%">
                </div>
            </div>
            <section class="flex items-center gap-2 w-full md:max-w-sm">
                <img src={coverURL} alt="Cover Art" class="size-10 shrink-0 rounded-md overflow-hidden">
                <div class="flex flex-col leading-tight">
                    <h3 class="text-sm font-semibold line-clamp-1">
                        {audioPlayer.currentTrack.name}
                    </h3>
                    <p class="text-xs text-muted-foreground line-clamp-1">
                        <a href={resolve('/')}>
                            {releaseInfo.current?.user.name}
                        </a>
                    </p>
                </div>
                <div class="shrink-0 flex items-center gap-1 ml-auto">
                    <Button variant="ghost" size="icon" disabled={!audioPlayer.previousable} onclick={() => audioPlayer.previous()}>
                        <RewindIcon fill="currentColor"/>
                    </Button>
                    <Button variant="default" size="icon" disabled={!audioPlayer.currentTrack} onclick={() => audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause()}>
                        {#if audioPlayer.status == 'buffering'}
                            <LoaderIcon class="animate-spin"/>
                        {:else if audioPlayer.paused}
                            <PlayIcon fill="currentColor"/>
                        {:else}
                            <PauseIcon fill="currentColor"/>
                        {/if}
                    </Button>
                    <Button variant="ghost" size="icon" disabled={!audioPlayer.skippable} onclick={() => audioPlayer.next()}>
                        <FastForwardIcon fill="currentColor"/>
                    </Button>
                </div>
            </section>
            <div class="items-center justify-between w-full hidden md:flex gap-2 text-xs text-muted-foreground">
                <span>{formatDuration(audioPlayer.currentTime || 0)}</span>
                {#if audioPlayer.duration}
                    <RangeSlider
                        on:start={() => audioPlayer.pause()}
                        on:stop={() => audioPlayer.play()}
                        on:change={(e) => audioPlayer.seek(e.detail.value)}
                        bind:value={audioPlayer.currentTime}
                        step={0.5}
                        range="min"
                        min={0}
                        max={audioPlayer.duration}
                        springValues={{ stiffness: 0.3, damping: 0.9 }}
                        disabled={!audioPlayer.currentTrack}
                        class="m-0! w-[calc(100%-4rem)]"
                    />
                {/if}
                <span>{formatDuration(audioPlayer.duration || 0)}</span>
            </div>
            <div class="hidden md:flex gap-2">
                <Button variant="ghost" size="icon" class="ml-auto">
                    <ListMusicIcon/>
                </Button>
                <Button variant={audioPlayer.repeat != 'none' ? "secondary" : "ghost"} size="icon" onclick={toggleRepeat}>
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
