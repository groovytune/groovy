<script lang="ts">
    import { resource } from 'runed';
    import GenreSearchInput from '$lib/components/shared/app/release/GenreSearchInput.svelte';
    import { resolve } from '$app/paths';
    import type { GETResponse } from '../../api/chart/tracks/+server';
    import { ChartLineIcon, LoaderCircleIcon, MusicIcon } from '@lucide/svelte';
    import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '$lib/components/ui/empty';
    import TrackItem from '$lib/components/shared/app/release/track/TrackItem.svelte';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    let { data } = $props();

    let genre: Record<'id'|'name', string>|null = $derived(data.genre);

    const tracks = resource(
        [() => genre?.id],
        async ([genreId]) => {
            const res = await fetch(
                resolve('/(app)/api/chart/tracks') +
                (genreId ? `?genre=${encodeURIComponent(genreId)}` : '')
            );

            if (!res.ok) {
                throw new Error('Failed to fetch tracks');
            }

            return res.json() as Promise<GETResponse>;
        },
        {
            lazy: true,
            debounce: 300
        }
    );

    onMount(() => {
        tracks.mutate(data.tracks);
    });
</script>

<h1 class="text-2xl sm:text-4xl font-bold my-4 px-5 flex items-center gap-2">
    <ChartLineIcon class="text-primary size-7 sm:size-8"/>
    {#if genre}
        Top {genre.name} Tracks
    {:else}
        Top {tracks.current?.length || ''} Tracks
    {/if}
</h1>
<div class="flex flex-col p-5 gap-5">
    <section>
        <GenreSearchInput
            bind:value={
                () => genre ? [genre] : [],
                (v) => genre = v.length ? v[0] : null
            }
            placeholder="Search genres..."
            limit={6}
            single
        />
    </section>
    <section class="flex flex-col">
        {#if !tracks.loading && tracks.current?.length}
            {#each tracks.current as track, index (track.id)}
                <div class="flex items-center border-b last:border-b-0">
                    <span class="w-6 text-right mr-4 text-muted-foreground">{index + 1}</span>
                    <TrackItem
                        cover
                        {track}
                        class="bg-transparent! cursor-pointer"
                        onclick={() => goto(resolve(
                            '/(app)/release/[releaseId]/track/[trackId]',
                            { releaseId: track.releaseId, trackId: track.id }
                        ))}
                    />
                </div>
            {/each}
        {:else}
            <Empty class="min-h-96">
                <EmptyHeader class="gap-0">
                    <EmptyMedia variant="icon">
                        {#if tracks.loading}
                            <LoaderCircleIcon class="animate-spin"/>
                        {:else}
                            <MusicIcon/>
                        {/if}
                    </EmptyMedia>
                    <EmptyTitle>
                        {#if tracks.loading}
                            Loading tracks...
                        {:else}
                            No tracks found
                        {/if}
                    </EmptyTitle>
                    <EmptyDescription>
                        {#if tracks.loading}
                            Let's wait a moment while we fetch the top tracks for you.
                        {:else}
                            Try selecting a different genre or check back later.
                        {/if}
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        {/if}
    </section>
</div>
