<script lang="ts">
    import { Item, ItemContent, ItemDescription, ItemTitle } from '$lib/components/ui/item';
    import PostForm from '$lib/components/shared/app/post/forms/PostForm.svelte';
    import { SquarePenIcon } from '@lucide/svelte';
    import PostFormFields from '$lib/components/shared/app/post/forms/PostFormFields.svelte';
</script>

<PostForm class="grid">
    {#snippet children({ form })}
        <Item size="sm" class="p-5 border-b-border rounded-none">
            <ItemContent class="gap-0">
                <ItemTitle class="leading-tight text-2xl font-bold">
                    <SquarePenIcon class="text-primary"/>
                    Create Post
                </ItemTitle>
                <ItemDescription class="leading-tight pl-8">
                    Share your thoughts with your followers.
                </ItemDescription>
            </ItemContent>
        </Item>
        <div class="grid gap-5">
            <PostFormFields
                {form}
                class="bg-transparent! p-2 border-0 min-h-96! border-b rounded-none ring-0! border-border!"
                errorClass="px-5"
                mediaClass="px-5"
            />
        </div>
    {/snippet}
</PostForm>
