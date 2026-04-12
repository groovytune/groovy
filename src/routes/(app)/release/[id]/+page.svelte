<script lang="ts">
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '$lib/components/ui/item';
    import { CirclePlusIcon, EllipsisIcon, ListMusicIcon, PencilIcon, PlayIcon, TextAlignStartIcon, Trash2Icon } from '@lucide/svelte';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio';
    import { Button } from '$lib/components/ui/button';
    import { dndzone } from 'svelte-dnd-action';
    import { flip } from 'svelte/animate';
    import ExplicitIcon from '$lib/components/shared/ExplicitIcon.svelte';
    import { auth } from '$lib/client/auth.js';
    import { toast } from 'svelte-sonner';
    import { superForm } from 'sveltekit-superforms';
    import { zod4 } from 'sveltekit-superforms/adapters';
    import { editTracklistSchema } from '$lib/schema/track.js';
    import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '$lib/components/ui/empty';

    let { data } = $props();

    const session = auth.useSession();

    // svelte-ignore state_referenced_locally
    const form = superForm(data.form, {
        validators: zod4(editTracklistSchema),
        clearOnSubmit: 'errors-and-message',
        dataType: 'json',
        taintedMessage: true,
        onError: event => {
            console.error('Form submission error:', event.result);
            toast.error(event.result.error.message);
        }
    })

    const { form: formData, enhance, submitting, tainted } = form;
</script>

<form use:enhance method="POST" class="w-full flex md:flex-row flex-col">
    <side class="size-full flex flex-col items-center md:max-w-96 pb-5">
        <div class="p-5 w-full max-w-sm relative">
            <AspectRatio class="w-full rounded-md bg-muted">
                <img src={data.release.cover} alt="Release Cover" class="size-full object-cover rounded-md"/>
                <img src={data.release.cover} alt="Release Cover" class="size-full object-cover absolute -z-10 top-0 left-0 opacity-50 saturate-150 blur-2xl"/>
            </AspectRatio>
        </div>
        <header class="w-full max-w-sm text-center px-5">
            <h1
                class="text-2xl leading-tight font-semibold line-clamp-3"
                style="word-wrap: break-word;"
            >
                {data.release.name}
                {#if data.release.explicit}
                    <ExplicitIcon/>
                {/if}
            </h1>
            <p class="text-sm leading-tight text-muted-foreground">
                {$session.data?.user.name || 'Unknown Artist'}
            </p>
            <p
                class="text-xs leading-tight text-muted-foreground/60 line-clamp-2 hover:line-clamp-none mt-2"
                style="word-wrap: break-word;"
                title={data.release.description}
            >
                {data.release.description || ''}
            </p>
            <div class="flex gap-2 justify-center my-5 max-w-sm px-20">
                <Button variant="outline" size="icon">
                    <PlayIcon/>
                </Button>
                <Button class="w-full">
                    <CirclePlusIcon/>
                    Add Tracks
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        {#snippet child({ props })}
                            <Button {...props} variant="outline" size="icon">
                                <EllipsisIcon/>
                            </Button>
                        {/snippet}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent class="mx-2">
                        <DropdownMenuItem>
                            <PencilIcon/>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem class="text-destructive!">
                            <Trash2Icon class="text-current"/>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    </side>
    {#if $formData.tracks.length}
        <div
            use:dndzone={{
                items: $formData.tracks,
                flipDurationMs: 300,
                delayTouchStart: 500,
                dragDisabled: $submitting
            }}
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
        </div>
        {#if $tainted}
            <Button>Save</Button>
        {/if}
    {:else}
        <div class="flex justify-center">
            <Empty class="bg-muted/50 m-5 py-10 gap-0 min-h-72 max-w-sm">
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
</form>
