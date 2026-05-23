<script lang="ts">
    import { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import { Button, type ButtonProps } from '../../../ui/button';
    import NewPostDialog from './NewPostDialog.svelte';

    let {
        ref = $bindable(null),
        children,
        ...props
    }: ButtonProps = $props();

    const dialogState: DialogState = new DialogState({ id: 'new-post-dialog' });
</script>

<Button {...props} bind:ref onclick={() => dialogState.open()}>
    {@render children?.()}
</Button>

<NewPostDialog {dialogState}/>
