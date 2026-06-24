<script lang="ts">
    import { FastForwardIcon, LoaderCircleIcon, PauseIcon, PlayIcon, Repeat1Icon, RepeatIcon, RewindIcon, ShuffleIcon } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import { cn } from '$lib/helpers/utils';

    const audioPlayer = AudioPlayer.context.get();
</script>

<Button
    variant="ghost"
    size="icon-sm"
    class={cn(
        "bg-transparent! shadow-none",
        audioPlayer.shuffled && 'bg-white/80! text-black!'
    )}
    onclick={() => audioPlayer.shuffled ? audioPlayer.unshuffle() : audioPlayer.shuffle()}
>
    <ShuffleIcon/>
</Button>
<Button
    variant="ghost"
    size="icon-lg"
    class="size-15 hover:bg-white/5! bg-transparent! shadow-none"
    disabled={!audioPlayer.previousable}
    onclick={() => audioPlayer.previous()}
>
    <RewindIcon fill="currentColor" class="size-7"/>
</Button>
<Button
    variant="ghost"
    size="icon-lg"
    class="size-18 shadow-none hover:bg-white/5!"
    disabled={!audioPlayer.currentTrack}
    onclick={() => audioPlayer.togglePlay()}
>
    {#if audioPlayer.status == 'buffering'}
        <LoaderCircleIcon class="animate-spin size-12"/>
    {:else if audioPlayer.paused}
        <PlayIcon fill="currentColor" class="size-12"/>
    {:else}
        <PauseIcon fill="currentColor" class="size-12"/>
    {/if}
</Button>
<Button
    variant="ghost"
    size="icon-lg"
    class="size-15 hover:bg-white/5! bg-transparent! shadow-none"
    disabled={!audioPlayer.skippable}
    onclick={() => audioPlayer.next()}
>
    <FastForwardIcon class="size-7" fill="currentColor"/>
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
