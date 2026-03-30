<script lang="ts">
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '$lib/components/ui/item';
    import { EllipsisIcon, PencilIcon, PlusIcon, TextAlignStartIcon, Trash2Icon } from '@lucide/svelte';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio/index.js';
    import { Button } from '$lib/components/ui/button';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { dndzone } from 'svelte-dnd-action';
    import { flip } from 'svelte/animate';
    import { createId } from '@paralleldrive/cuid2';

    let { data } = $props();

    let tracks = $state(
        Array(20)
            .fill({})
            .map(() => ({ id: createId(), name: createId(), duration: '4:20' }))
    );
</script>

<section class="w-full flex md:flex-row flex-col gap-5">
    <side class="size-full flex flex-col items-center md:max-w-96">
        <div class="p-5 w-full max-w-sm">
            <AspectRatio class="w-full rounded-md shadow-md bg-muted overflow-hidden">
                <img src={data.release.cover} alt="Release Cover" class="size-full object-cover"/>
            </AspectRatio>
        </div>
        <header class="flex justify-between items-center p-5 w-full">
            <div class="w-full max-w-[calc(100%-130px)]">
                <h1 class="text-2xl leading-tight font-bold line-clamp-3 whitespace-break-spaces" style="word-wrap: break-word;">
                    {data.release.name}
                </h1>
                <p class="text-sm leading-tight text-muted-foreground">
                    Manage your release tracks
                </p>
            </div>
            <Button href={resolve('/(app)/release/[id]/tracks', { id: page.params.id! })}>
                <PlusIcon/>
                Add Track
            </Button>
        </header>
    </side>
    <div
        use:dndzone={{ items: tracks, flipDurationMs: 300 }}
        onconsider={e => tracks = e.detail.items}
        onfinalize={e => tracks = e.detail.items}
        class="grid gap-2 p-5 w-full pt-0 md:pt-5"
    >
        {#each tracks as track, i (track.id)}
            <div animate:flip={{ duration: 300 }}>
                <Item variant="muted">
                    <ItemContent>
                        <ItemTitle>{i + 1} - {track.name}</ItemTitle>
                        <ItemDescription>{track.duration}</ItemDescription>
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
            </div>
        {/each}
    </div>
</section>
