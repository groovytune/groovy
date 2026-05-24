<script lang="ts">
    import type { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import { newPostSchema } from '$lib/schema/post';
    import { type SuperForm } from 'sveltekit-superforms';
    import type z from 'zod';
    import PostForm from './forms/PostForm.svelte';
    import PostFormFields from './forms/PostFormFields.svelte';
    import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '$lib/components/ui/item';
    import { Dialog, DialogContent, DialogHeader } from '$lib/components/ui/dialog';
    import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
    import { UserRoundIcon } from '@lucide/svelte';
    import { auth } from '$lib/client/auth';

    let {
        dialogState
    }: {
        dialogState: DialogState;
    } = $props();

    const session = auth.useSession();

    let form: SuperForm<z.infer<typeof newPostSchema>>|null = $state(null);

    $effect(() => {
        return form?.submitting.subscribe(submitting => {
            dialogState.isClosable = !submitting;
        });
    });

    $effect(() => {
        if (dialogState.isOpen !== dialogState.isActive) dialogState.toggle(dialogState.isActive);
    });
</script>

<Dialog bind:open={() => dialogState.isOpen, dialogState.toggle}>
    <DialogContent class="max-h-[80dvh] overflow-auto flex flex-col gap-4">
        <DialogHeader class="text-start">
            <Item size="sm" class="p-0">
                <ItemMedia>
                    <Avatar>
                        <AvatarImage src={$session.data?.user.image}/>
                        <AvatarFallback>
                            <UserRoundIcon/>
                        </AvatarFallback>
                    </Avatar>
                </ItemMedia>
                <ItemContent class="gap-0">
                    <ItemTitle class="leading-tight">
                        Create Post
                    </ItemTitle>
                    <ItemDescription class="leading-tight text-xs">
                        Share your thoughts, photos, or updates with your followers.
                    </ItemDescription>
                </ItemContent>
            </Item>
        </DialogHeader>
        <PostForm bind:form>
            {#snippet children({ form })}
                <PostFormFields {form}/>
            {/snippet}
        </PostForm>
    </DialogContent>
</Dialog>
