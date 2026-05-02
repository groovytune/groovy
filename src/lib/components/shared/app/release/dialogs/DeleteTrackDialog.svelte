<script lang="ts">
    import { LoaderIcon, SquareXIcon, Trash2Icon } from '@lucide/svelte';
    import ResponsiveDialog from '$lib/components/shared/ResponsiveDialog.svelte';
    import DeleteTracksForm from '../forms/DeleteTracksForm.svelte';
    import { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import type { Track } from '$lib/server/prisma/client';
    import { Button } from '$lib/components/ui/button';

    let {
        tracks,
        releaseId,
        dialogState,
        ondelete,
    }: {
        tracks: Track[];
        releaseId: string;
        dialogState: DialogState;
        ondelete?: (trackIds: string[]) => void;
    } = $props();
</script>

<ResponsiveDialog {dialogState}>
    {#snippet title()}
        Delete <span class="text-primary">{tracks.length > 1 ? `${tracks.length} tracks` : tracks[0].name}</span>?
    {/snippet}
    {#snippet content({ type })}
        <p class:px-4={type === 'drawer'}>
            Are you sure you want to delete this track? This action cannot be undone.
        </p>
    {/snippet}
    {#snippet footer()}
        <DeleteTracksForm
            releaseId={releaseId}
            trackIds={tracks.map((t) => t.id)}
            onerror={() => dialogState.isClosable = true}
            ondelete={() => {
                dialogState.close({ force: true });
                ondelete?.(tracks.map((t) => t.id));
            }}
        >
            {#snippet children({ form: delForm, submitting, deleted })}
                <Button
                    variant="secondary"
                    disabled={submitting || deleted}
                    onclick={() => dialogState.close({ force: true })}
                >
                    <SquareXIcon/>
                    Cancel
                </Button>
                <Button
                    variant="destructive"
                    disabled={submitting || deleted}
                    onclick={() => {
                        delForm.submit();
                        dialogState.isClosable = false;
                    }}
                >
                    {#if submitting}
                        <LoaderIcon class="animate-spin"/>
                        Deleting...
                    {:else}
                        <Trash2Icon class="text-current"/>
                        Delete
                    {/if}
                </Button>
            {/snippet}
        </DeleteTracksForm>
    {/snippet}
</ResponsiveDialog>
