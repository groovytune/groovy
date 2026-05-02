<script lang="ts">
    import { Disc3Icon, ListMusicIcon, Music4Icon, PlusIcon } from '@lucide/svelte';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { Button } from '$lib/components/ui/button';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import type { Snippet } from 'svelte';

    let {
        children
    }: {
        children?: Snippet<[{ props: Record<string, unknown> }]>;
    } = $props();
</script>

<DropdownMenu>
    <DropdownMenuTrigger>
        {#snippet child({ props })}
            {#if children}
                {@render children({ props })}
            {:else}
                <Button {...props} class="md:w-auto w-9 sm:inline-flex hidden">
                    <PlusIcon/>
                    <span class="md:inline hidden">Create</span>
                </Button>
            {/if}
        {/snippet}
    </DropdownMenuTrigger>
    <DropdownMenuContent side="top" align="end" sideOffset={18}>
        <DropdownMenuItem
            onclick={
                // eslint-disable-next-line svelte/no-navigation-without-resolve
                () => goto(resolve('/(app)/release/new') + '?type=album')
            }
        >
            <Disc3Icon/>
            Album
        </DropdownMenuItem>
        <DropdownMenuItem
            onclick={
                // eslint-disable-next-line svelte/no-navigation-without-resolve
                () => goto(resolve('/(app)/release/new') + '?type=single')
            }
        >
            <Music4Icon/>
            Single
        </DropdownMenuItem>
        <DropdownMenuItem
            onclick={
                // eslint-disable-next-line svelte/no-navigation-without-resolve
                () => goto(resolve('/(app)/release/new') + '?type=ep')
            }
        >
            <ListMusicIcon/>
            EP
        </DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
