<script lang="ts">
    import { LoaderIcon, SquareXIcon, Trash2Icon } from '@lucide/svelte';
    import ResponsiveDialog from '$lib/components/shared/ResponsiveDialog.svelte';
    import { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import { Button } from '$lib/components/ui/button';
    import DeleteReleaseForm from '../forms/DeleteReleaseForm.svelte';
    import type { Release } from '$lib/server/prisma/browser';

    let {
        releaseId,
        name,
        dialogState,
        ondelete,
    }: {
        releaseId: string;
        name?: string;
        dialogState: DialogState;
        ondelete?: (release: Release & Record<'_count', Record<'tracks', number>>) => void;
    } = $props();
</script>

<ResponsiveDialog {dialogState}>
    {#snippet title()}
        Delete <span class="text-primary">{name || releaseId}</span>?
    {/snippet}
    {#snippet content({ type })}
        <p class:px-4={type === 'drawer'}>
            Are you sure you want to delete this release? This action cannot be undone.
        </p>
    {/snippet}
    {#snippet footer()}
        <DeleteReleaseForm
            releaseId={releaseId}
            onerror={() => dialogState.isClosable = true}
            ondelete={release => {
                dialogState.close({ force: true });
                ondelete?.(release);
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
        </DeleteReleaseForm>
    {/snippet}
</ResponsiveDialog>
