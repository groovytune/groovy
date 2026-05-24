<script lang="ts">
    import { LoaderIcon, SquareXIcon, Trash2Icon } from '@lucide/svelte';
    import ResponsiveDialog from '$lib/components/shared/ResponsiveDialog.svelte';
    import { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import { Button } from '$lib/components/ui/button';
    import DeletePostForm from '../forms/DeletePostForm.svelte';
    import type { Post } from '$lib/server/prisma/browser';

    let {
        postId,
        dialogState,
        ondelete,
    }: {
        postId: string;
        dialogState: DialogState;
        ondelete?: (post: Post) => void;
    } = $props();
</script>

<ResponsiveDialog {dialogState}>
    {#snippet title()}
        Delete this your post?
    {/snippet}
    {#snippet content({ type })}
        <p class:px-4={type === 'drawer'}>
            Are you sure you want to delete this post? This action cannot be undone.
        </p>
    {/snippet}
    {#snippet footer()}
        <DeletePostForm
            {postId}
            onerror={() => dialogState.isClosable = true}
            ondelete={postId => {
                dialogState.close({ force: true });
                ondelete?.(postId);
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
        </DeletePostForm>
    {/snippet}
</ResponsiveDialog>
