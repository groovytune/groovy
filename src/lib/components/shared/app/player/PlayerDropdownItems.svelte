<script lang="ts">
    import { ListPlusIcon, ListStartIcon, PlayIcon, ShuffleIcon } from '@lucide/svelte';
    import type { Track } from '$lib/server/prisma/browser';
    import { DropdownMenuItem } from '$lib/components/ui/dropdown-menu';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import { shuffleArray } from '../../../../helpers/utils';
    import { QueueTrack } from '../../../../helpers/classes/QueueTrack';

    let {
        tracks,
        disabled = false
    }: {
        tracks: Track[];
        disabled?: boolean;
    } = $props();

    const audioPlayer = AudioPlayer.context.get();

    async function shufflePlay() {
        const shuffled = shuffleArray(
            tracks.map(
                (t, i) => new QueueTrack(t)
                    .regenerateSortId(Date.now() + i)
            )
        );

        audioPlayer.shuffled = true;
        await audioPlayer.replaceQueue(shuffled);
        await audioPlayer.play();
    }
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
{#if tracks.length > 2}
    <DropdownMenuItem
        disabled={disabled}
        onclick={shufflePlay}
    >
        <ShuffleIcon/>
        Shuffle Play
    </DropdownMenuItem>
{/if}
