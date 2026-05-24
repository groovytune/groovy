<script lang="ts">
    import { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import Button, { type ButtonProps } from '$lib/components/ui/button/button.svelte';
    import DeleteTrackDialog from '../dialogs/DeleteTrackDialog.svelte';
    import type { Track } from '$lib/server/prisma/browser';

    let {
        tracks,
        releaseId,
        ondelete,
        ref = $bindable(null),
        children,
        ...props
    }: {
        tracks: Track[];
        releaseId: string;
        ondelete?: (tracks: string[]) => void;
    } & ButtonProps = $props();

    const deleteDialogState = new DialogState({ id: `delete-track-${releaseId}-${tracks.map(t => t.id).join('')}` });
</script>

<Button
    bind:ref
    {...props}
    onclick={() => deleteDialogState.open()}
>
    {@render children?.()}
</Button>
<DeleteTrackDialog
    {tracks}
    {releaseId}
    dialogState={deleteDialogState}
    ondelete={deletedIds => {
        deleteDialogState.close({ force: true });
        ondelete?.(deletedIds);
    }}
/>
