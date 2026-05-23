<script lang="ts">
    import { resolve } from '$app/paths';
    import { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import isMobile from 'is-mobile';
    import { Button, type ButtonProps } from '$lib/components/ui/button';
    import NewPostDialog from './NewPostDialog.svelte';

    let {
        ref = $bindable(null),
        children,
        ...props
    }: ButtonProps = $props();

    const dialogState: DialogState = new DialogState({ id: 'new-post-dialog' });
</script>

<Button
    {...props}
    bind:ref
    href={resolve('/(app)/post')}
    onclick={e => {
        if (isMobile()) return;

        e.preventDefault();
        dialogState.open();
    }}
>
    {@render children?.()}
</Button>

<NewPostDialog {dialogState}/>
