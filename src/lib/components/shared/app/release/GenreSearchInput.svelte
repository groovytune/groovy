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
        ...props
    }: {
        value?: Record<'id'|'name', string>[];
        query?: string;
    } & Omit<HTMLInputAttributes, "type"|"files"|"value"> & {
        type?: Exclude<HTMLInputTypeAttribute, "file">;
    } = $props();

    let initialFocus = $state(false);

    const genresResource = resource(
        [() => query],
        async ([query]) => {
            const res = await fetch(
                resolve('/api/genres') +
                `?search=${encodeURIComponent(query)}`
            );

            return res.json() as Promise<Record<'id'|'name', string>[]>;
        },
        {
            debounce: 500
        }
    );
</script>

<InputGroup>
    <InputGroupInput
        {...props}
        {disabled}
        bind:value={query}
        onfocus={() => initialFocus = true}
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

{#if genresResource.current?.length || value.length || initialFocus}
    <div class="flex flex-wrap gap-2 mt-2">
        {#each value as genre (genre.id)}
            <Button
                class="text-sm px-2 h-6"
                variant="default"
                size="sm"
                disabled={disabled}
                onclick={() => value = value.filter((v) => v.id !== genre.id)}
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
                onclick={() => value = [...value, genre]}
            >
                {genre.name}
            </Button>
        {/each}
        {#if genresResource.current && genresResource.current.length === 0}
            <p class="text-sm text-muted-foreground">No genres found.</p>
        {/if}
    </div>
{/if}
