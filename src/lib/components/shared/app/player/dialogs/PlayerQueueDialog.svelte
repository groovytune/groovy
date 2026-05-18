<script lang="ts">
    import type { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
    import PlayerQueueOrder from '../PlayerQueueOrder.svelte';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../ui/empty';
    import { ListMusicIcon } from '@lucide/svelte';

    let {
        dialogState
    }: {
        dialogState: DialogState;
    } = $props();

    const audioPlayer = AudioPlayer.context.get();

    $effect(() => {
        if (dialogState.isOpen !== dialogState.isActive) dialogState.toggle(dialogState.isActive);
    });
</script>

<Dialog bind:open={() => dialogState.isOpen, dialogState.toggle}>
    <DialogContent class="sm:max-h-[80dvh] overflow-auto">
        <DialogHeader class="text-start">
            <DialogTitle>Queue</DialogTitle>
            <DialogDescription></DialogDescription>
        </DialogHeader>
        {#if audioPlayer.queue.length}
            <PlayerQueueOrder/>
        {:else}
            <Empty>
                <EmptyHeader class="gap-0">
                    <EmptyMedia variant="icon">
                        <ListMusicIcon/>
                    </EmptyMedia>
                    <EmptyTitle>Your queue is empty</EmptyTitle>
                    <EmptyDescription>
                        Add some songs to your queue to see them here.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        {/if}
    </DialogContent>
</Dialog>
