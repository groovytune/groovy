<script lang="ts">
    import { resolve } from '$app/paths';
    import { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import isMobile from 'is-mobile';
    import { Button, type ButtonProps } from '$lib/components/ui/button';
    import NewPostDialog from './dialogs/NewPostDialog.svelte';
    import { auth } from '$lib/client/auth';
    import { createAuthRedirect } from '$lib/helpers/utils';
    import { page } from '$app/state';

    let {
        ref = $bindable(null),
        children,
        ...props
    }: ButtonProps = $props();

    const dialogState: DialogState = new DialogState({ id: 'new-post-dialog' });
    const session = auth.useSession();
</script>

<Button
    {...props}
    bind:ref
    href={$session.data?.user ? resolve('/(app)/post') : createAuthRedirect('signin', page.url)}
    onclick={e => {
        if (isMobile() || !$session.data?.user) return;

        e.preventDefault();
        dialogState.open();
    }}
>
    {@render children?.()}
</Button>

<NewPostDialog {dialogState}/>
