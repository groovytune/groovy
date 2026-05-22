<script lang="ts">
    import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Button } from '$lib/components/ui/button';
    import { resource } from 'runed';
    import { resolve } from '$app/paths';
    import TrackItem from '../release/track/TrackItem.svelte';
    import type { Track } from '$lib/server/prisma/browser';
    import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '$lib/components/ui/empty';
    import { LoaderCircleIcon, Music4Icon } from '@lucide/svelte';

    const tracks = resource(
        [],
        async () => {
            const res = await fetch(resolve('/(app)/api/suggestions/tracks'))
            return await res.json() as Track[];
        }
    )
</script>

<Card>
    <CardHeader>
        <CardTitle>
            Suggested Tracks
        </CardTitle>
        <CardDescription>
            Discover music
        </CardDescription>
        <CardAction>
            <Button variant="outline" size="sm">
                Refresh
            </Button>
        </CardAction>
    </CardHeader>
    <CardContent class="grid gap-2">
        {#if tracks.loading || tracks.error || !tracks.current?.length}
            <Empty>
                <EmptyHeader class="gap-0">
                    <EmptyMedia variant="icon">
                        {#if tracks.loading}
                            <LoaderCircleIcon class="size-6 animate-spin"/>
                        {:else}
                            <Music4Icon class="size-6"/>
                        {/if}
                    </EmptyMedia>
                    <EmptyTitle>
                        {tracks.loading ? 'Loading tracks' : tracks.error ? 'Failed to load' : 'No suggestions'}
                    </EmptyTitle>
                    <EmptyDescription>
                        {tracks.error ? 'Please try again later.' : 'You\'re all caught up!'}
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        {:else}
            {#each tracks.current as track (track.id)}
                <TrackItem
                    cover
                    class="p-0 bg-transparent!"
                    track={track}
                />
            {/each}
        {/if}
    </CardContent>
</Card>
