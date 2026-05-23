<script lang="ts">
    import type { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import ResponsiveDialog from '$lib/components/shared/ResponsiveDialog.svelte';
    import { newPostSchema } from '$lib/schema/post';
    import { type SuperForm } from 'sveltekit-superforms';
    import type z from 'zod';
    import PostForm from './forms/PostForm.svelte';
    import PostFormFields from './forms/PostFormFields.svelte';

    let {
        dialogState
    }: {
        dialogState: DialogState;
    } = $props();

    let form: SuperForm<z.infer<typeof newPostSchema>>|null = $state(null);

    $effect(() => {
        return form?.submitting.subscribe(submitting => {
            dialogState.isClosable = !submitting;
        });
    });
</script>

<ResponsiveDialog
    {dialogState}
    dialogContentProps={{ class: 'max-h-screen overflow-y-auto' }}
>
    {#snippet title({ type })}
        <h1 class="text-lg font-bold" class:text-center={type === 'drawer'}>
            Create Post
        </h1>
    {/snippet}
    {#snippet content({ type })}
        <div class:p-4={type === 'drawer'}>
            <PostForm bind:form>
                {#snippet children({ form })}
                    <PostFormFields {form}/>
                {/snippet}
            </PostForm>
        </div>
    {/snippet}
</ResponsiveDialog>
