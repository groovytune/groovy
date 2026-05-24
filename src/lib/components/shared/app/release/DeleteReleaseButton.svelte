<script lang="ts">
    import { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import type { Release } from '$lib/server/prisma/browser';
    import DeleteReleaseDialog from './dialogs/DeleteReleaseDialog.svelte';
    import Button, { type ButtonProps } from '$lib/components/ui/button/button.svelte';

    let {
        release,
        ondelete,
        ref = $bindable(null),
        children,
        ...props
    }: {
        release: Release;
        ondelete?: (release: Release) => void;
    } & ButtonProps = $props();

    const deleteDialogState = new DialogState({ id: `delete-release-${release.id}` });
</script>

<Button
    bind:ref
    {...props}
    onclick={() => deleteDialogState.open()}
>
    {@render children?.()}
</Button>
<DeleteReleaseDialog
    releaseId={release.id}
    name={release.name}
    dialogState={deleteDialogState}
    ondelete={release => {
        deleteDialogState.close({ force: true });
        ondelete?.(release);
    }}
/>
