<script lang="ts">
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { EllipsisIcon, ListMusicIcon, PencilIcon, TextAlignStartIcon, Trash2Icon } from '@lucide/svelte';
    import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '$lib/components/ui/empty';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '$lib/components/ui/item';
    import ExplicitIcon from '$lib/components/shared/ExplicitIcon.svelte';
    import { type SuperForm } from 'sveltekit-superforms';
    import { editTracksSchema } from '$lib/schema/track';
    import { Button } from '$lib/components/ui/button';
    import { dndzone } from 'svelte-dnd-action';
    import { auth } from '$lib/client/auth';
    import { flip } from 'svelte/animate';
    import { toast } from 'svelte-sonner';
    import type z from 'zod';

    let {
        form
    }: {
        form: SuperForm<z.infer<typeof editTracksSchema>, unknown>;
    } = $props();

    const session = auth.useSession();
    const { form: formData, enhance, submitting, tainted } = form;
</script>

{#if $formData.tracks.length > 0}
    <form
        use:dndzone={{
            items: $formData.tracks,
            flipDurationMs: 300,
            delayTouchStart: 500,
            dragDisabled: $submitting || $formData.tracks.length < 2
        }}
        use:enhance
        action="?/edit"
        method="POST"
        onconsider={e => $formData.tracks = e.detail.items}
        onfinalize={e => $formData.tracks = e.detail.items}
        class="grid gap-2 p-5 w-full pt-0 md:pt-5 outline-none!"
    >
        {#each $formData.tracks as track (track.name)}
            <a
                href="#/"
                onclick={() => toast(track.name)}
                animate:flip={{ duration: 300 }}
            >
                <Item class="p-2 hover:bg-secondary/50 rounded-md">
                    <ItemContent>
                        <ItemTitle
                            class="line-clamp-2 w-full"
                            style="word-wrap: break-word;"
                        >
                            <span>
                                {track.name}
                                {#if track.explicit}
                                    <ExplicitIcon class="size-4.5"/>
                                {/if}
                            </span>
                        </ItemTitle>
                        <ItemDescription>
                            {$session.data?.user.name || 'Unknown Artist'}
                        </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                {#snippet child({ props })}
                                    <Button {...props} variant="ghost" size="icon">
                                        <EllipsisIcon/>
                                    </Button>
                                {/snippet}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent class="mx-2">
                                <DropdownMenuItem>
                                    <PencilIcon/>
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <TextAlignStartIcon/>
                                    Edit Lyrics
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem class="text-destructive!">
                                    <Trash2Icon class="text-current"/>
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </ItemActions>
                </Item>
            </a>
        {/each}
    </form>
{#if $tainted}
    <Button>Save</Button>
{/if}
{:else}
    <div class="flex justify-center w-full">
        <Empty class="bg-muted/50 m-5 py-10 gap-0 min-h-72 max-w-sm lg:max-w-none">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <ListMusicIcon/>
                </EmptyMedia>
            </EmptyHeader>
            <EmptyTitle>
                No tracks added yet
            </EmptyTitle>
            <EmptyDescription>
                Click the "Add Tracks" to add your first track
            </EmptyDescription>
        </Empty>
    </div>
{/if}
