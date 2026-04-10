<script lang="ts">
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '$lib/components/ui/item';
    import { EllipsisIcon, PencilIcon, PlusIcon, TextAlignStartIcon, Trash2Icon } from '@lucide/svelte';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio';
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
        <div class="p-5 w-full max-w-sm relative">
            <AspectRatio class="rounded-md bg-muted">
                <img src={data.release.cover} alt="Release Cover" class="size-full object-cover rounded-md"/>
                <img src={data.release.cover} alt="Release Cover" class="size-full object-cover absolute -z-10 top-0 left-0 opacity-50 saturate-150 blur-3xl"/>
            </AspectRatio>
        </div>
        <header class="grid gap-5 justify-center w-full">
            <div class="w-full text-center">
                <h1 class="text-2xl leading-tight font-bold line-clamp-3 whitespace-break-spaces" style="word-wrap: break-word;">
                    {data.release.name}
                </h1>
                <p class="text-sm leading-tight text-muted-foreground">
                    {tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'} • <span class:capitalize={data.release.type != 'EP'}>{data.release.type.toLowerCase()}</span>
                </p>
            </div>
            <div class="text-center md:relative md:p-0">
                <Button href={resolve('/(app)/release/[id]', { id: page.params.id! })}>
                    <PlusIcon/>
                    <span>Add Track</span>
                </Button>
            </div>
        </header>
    </side>
    <div
        use:dndzone={{ items: tracks, flipDurationMs: 300 }}
        onconsider={e => tracks = e.detail.items}
        onfinalize={e => tracks = e.detail.items}
        class="grid gap-2 p-5 w-full pt-0 md:pt-5 outline-none!"
    >
        {#each tracks as track, i (track.id)}
            <div animate:flip={{ duration: 300 }}>
                <Item class="p-2 hover:bg-secondary/50 rounded-md">
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
