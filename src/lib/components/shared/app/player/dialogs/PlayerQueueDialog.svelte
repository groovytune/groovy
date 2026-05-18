<script lang="ts">
    import type { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
    import PlayerQueueOrder from '../PlayerQueueOrder.svelte';

    let {
        dialogState
    }: {
        dialogState: DialogState;
    } = $props();

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
        <PlayerQueueOrder/>
    </DialogContent>
</Dialog>
