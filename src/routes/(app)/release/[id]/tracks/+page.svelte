<script lang="ts">
    import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '$lib/components/ui/item';
    import { EllipsisIcon, PencilIcon, PlusIcon, TextAlignStartIcon, Trash2Icon } from '@lucide/svelte';
    import { Button } from '../../../../../lib/components/ui/button';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../../../lib/components/ui/dropdown-menu';

    let { data } = $props();

    let tracks = $state(Array(10).fill({ name: 'Track Name', duration: '4:20' }));
</script>

<header class="flex justify-between items-center p-5">
    <div class="w-full max-w-[calc(100%-130px)]">
        <h1 class="text-2xl leading-tight font-bold line-clamp-3 whitespace-break-spaces" style="word-wrap: break-word;">{data.release.name}</h1>
        <p class="text-sm leading-tight text-muted-foreground">Manage your release tracks</p>
    </div>
    <Button href={resolve('/(app)/release/[id]/tracks', { id: page.params.id! })}>
        <PlusIcon/>
        Add Track
    </Button>
</header>
<div class="grid gap-2 px-5 pb-5">
    {#each tracks as track, i (i)}
        <Item variant="muted">
            <ItemContent>
                <ItemTitle>{track.name}</ItemTitle>
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
    {/each}
</div>
