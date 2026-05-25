<script lang="ts">
    import type { HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';
    import { InputGroup, InputGroupAddon, InputGroupInput } from '$lib/components/ui/input-group';
    import { LoaderIcon, SearchIcon } from '@lucide/svelte';
    import { resource } from 'runed';
    import { resolve } from '$app/paths';
    import type { Track } from '$lib/server/prisma/browser';
    import TrackItem from '../release/track/TrackItem.svelte';

    let {
        value = $bindable(undefined),
        query = $bindable(''),
        disabled = false,
        limit,
        ...props
    }: {
        value?: Track|undefined;
        query?: string;
        initialFetch?: boolean;
        limit?: number;
    } & Omit<HTMLInputAttributes, "type"|"files"|"value"> & {
        type?: Exclude<HTMLInputTypeAttribute, "file">;
    } = $props();

    const tracks = resource(
        [() => query, () => limit],
        async ([query, limit ]) => {
            const res = await fetch(
                resolve('/api/search/tracks') +
                `?q=${encodeURIComponent(query)}&take=${limit}`
            );

            return res.json() as Promise<Track[]>;
        },
        {
            debounce: 500,
            lazy: true
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
                tracks.refetch();
            }
        }}
    />
    <InputGroupAddon align="inline-start">
        {#if tracks.loading}
            <LoaderIcon class="animate-spin"/>
        {:else}
            <SearchIcon/>
        {/if}
    </InputGroupAddon>
</InputGroup>

{#if tracks.current?.length || value}
    <div class="grid gap-1 border bg-card rounded p-2 mt-2">
        {#if value}
            <TrackItem track={value} cover variant="outline" class="border-primary/50!" onclick={() => value = undefined}/>
        {/if}
        {#each tracks.current as track (track.id)}
            {#if track.id !== value?.id}
                <TrackItem
                    {track}
                    cover
                    onclick={() => value = track}
                />
            {/if}
        {/each}
    </div>
{/if}
