<script lang="ts">
    import { ListPlusIcon, ListStartIcon, PlayIcon } from '@lucide/svelte';
    import type { Track } from '$lib/server/prisma/browser';
    import { DropdownMenuItem } from '$lib/components/ui/dropdown-menu';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';

    let {
        tracks,
        disabled = false
    }: {
        tracks: Track[];
        disabled?: boolean;
    } = $props();

    const audioPlayer = AudioPlayer.context.get();
</script>

<DropdownMenuItem
    disabled={disabled}
    onclick={async () => {
        audioPlayer.replaceQueue(tracks);
        await audioPlayer.play();
    }}
>
    <PlayIcon/>
    Play
</DropdownMenuItem>
<DropdownMenuItem
    disabled={disabled}
    onclick={async () => {
        audioPlayer.add(tracks);
        await audioPlayer.play();
    }}
>
    <ListPlusIcon/>
    Add to Queue
</DropdownMenuItem>
<DropdownMenuItem
    disabled={disabled}
    onclick={async () => {
        audioPlayer.add(tracks, true);
        await audioPlayer.play();
    }}
>
    <ListStartIcon/>
    Play Next
</DropdownMenuItem>
