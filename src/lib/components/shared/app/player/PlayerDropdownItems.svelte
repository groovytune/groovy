<script lang="ts">
    import { ListPlusIcon, ListStartIcon, PlayIcon } from '@lucide/svelte';
    import type { Track } from '$lib/server/prisma/browser';
    import { DropdownMenuItem } from '$lib/components/ui/dropdown-menu';
    import { AudioPlayerContext } from '$lib/contexts/player';

    let {
        track,
        disabled = false
    }: {
        track: Track;
        disabled?: boolean;
    } = $props();

    const audioPlayer = AudioPlayerContext.get();
</script>

<DropdownMenuItem
    disabled={disabled}
    onclick={async () => {
        await audioPlayer.replaceCurrentTrack(track);
        await audioPlayer.play();
    }}
>
    <PlayIcon/>
    Play
</DropdownMenuItem>
<DropdownMenuItem
    disabled={disabled}
    onclick={async () => {
        await audioPlayer.play(track);
    }}
>
    <ListPlusIcon/>
    Add to Queue
</DropdownMenuItem>
<DropdownMenuItem
    disabled={disabled}
    onclick={async () => {
        audioPlayer.add(track, true);
        await audioPlayer.play();
    }}
>
    <ListStartIcon/>
    Play Next
</DropdownMenuItem>
