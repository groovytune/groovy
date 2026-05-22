<script lang="ts">
    import type { HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';
    import { InputGroup, InputGroupAddon, InputGroupInput } from '$lib/components/ui/input-group';
    import { LoaderIcon, SearchIcon } from '@lucide/svelte';
    import { resource } from 'runed';
    import { resolve } from '$app/paths';
    import { Button } from '$lib/components/ui/button';

    let {
        value = $bindable([]),
        query = $bindable(''),
        disabled = false,
        single = false,
        initialFetch = true,
        limit,
        ...props
    }: {
        value?: Record<'id'|'name', string>[];
        query?: string;
        single?: boolean;
        initialFetch?: boolean;
        limit?: number;
    } & Omit<HTMLInputAttributes, "type"|"files"|"value"> & {
        type?: Exclude<HTMLInputTypeAttribute, "file">;
    } = $props();

    const genresResource = resource(
        [() => query, () => limit],
        async ([query, limit ]) => {
            const res = await fetch(
                resolve('/api/genres') +
                `?search=${encodeURIComponent(query)}&take=${limit}`
            );

            return res.json() as Promise<Record<'id'|'name', string>[]>;
        },
        {
            debounce: 500,
            // eslint-disable-next-line svelte/no-unused-svelte-ignore
            // svelte-ignore state_referenced_locally
            lazy: !initialFetch
        }
    );
</script>

<InputGroup>
    <InputGroupInput
        {...props}
        {disabled}
        bind:value={query}
        onkeydown={(e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                genresResource.refetch();
            }
        }}
    />
    <InputGroupAddon align="inline-start">
        {#if genresResource.loading}
            <LoaderIcon class="animate-spin"/>
        {:else}
            <SearchIcon/>
        {/if}
    </InputGroupAddon>
</InputGroup>

{#if genresResource.current?.length || value.length}
    <div class="flex flex-wrap gap-2 mt-2">
        {#each value as genre (genre.id)}
            <Button
                class="text-sm px-2 h-6"
                variant="default"
                size="sm"
                disabled={disabled}
                onclick={() => {
                    if (single) {
                        value = [];
                    } else {
                        value = value.filter((v) => v.id !== genre.id);
                    }
                }}
            >
                {genre.name}
            </Button>
        {/each}
        {#each genresResource.current?.filter((g) => !value.some((v) => v.id === g.id)) as genre (genre.id)}
            <Button
                class="text-sm px-2 h-6"
                variant="outline"
                size="sm"
                disabled={disabled}
                onclick={() => {
                    if (single) {
                        value = [genre];
                    } else {
                        value = [...value, genre];
                    }
                }}
            >
                {genre.name}
            </Button>
        {/each}
        {#if genresResource.current && genresResource.current.length === 0}
            <p class="text-sm text-muted-foreground">No genres found.</p>
        {/if}
    </div>
{/if}
