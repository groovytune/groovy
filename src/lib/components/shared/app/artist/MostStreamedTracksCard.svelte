<script lang="ts">
    import { Music4Icon } from '@lucide/svelte';
    import TrackItem from '$lib/components/shared/app/release/track/TrackItem.svelte';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
    import type { PartialUser } from '../../../../helpers/utils';
    import { resource } from 'runed';
    import { resolve } from '$app/paths';
    import type { GETResponse } from '../../../../../routes/(app)/api/discover/chart/streams/tracks/+server';
    import { AudioPlayer } from '../../../../helpers/classes/AudioPlayer.svelte';
    import { Skeleton } from '../../../ui/skeleton';
    import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../ui/empty';

    let {
        user
    }: {
        user: PartialUser;
    } = $props();

    const audioPlayer = AudioPlayer.context.get();

    const tracks = resource(
        () => user.id,
        async (userId) => {
            const response = await fetch(resolve('/api/discover/chart/streams/tracks') + `?userId=${userId}&take=5`);

            if (!response.ok) {
                throw new Error('Failed to fetch most streamed tracks');
            }

            return response.json() as Promise<GETResponse>;
        },
        {
            debounce: 500
        }
    )
</script>

<Card>
    <CardHeader>
        <CardTitle class="flex items-center gap-1">
            <Music4Icon class="size-5 -mt-1 text-primary"/>
            Most Streamed Tracks
        </CardTitle>
        <CardDescription>
            Top tracks by {user.name} based on total streams
        </CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-1">
        {#if tracks.loading}
            {#each { length: 5 }}
                <Skeleton class="h-13.5 rounded-lg"/>
            {/each}
        {:else if tracks.current?.length}
            {#each tracks.current as track (track.id)}
                <TrackItem
                    cover
                    track={track}
                    variant="outline"
                    onclick={async () => {
                        await audioPlayer.replaceCurrentTrack(track);
                        await audioPlayer.play();
                    }}
                />
            {/each}
        {:else}
            <Empty>
                <EmptyHeader class="gap-0">
                    <EmptyMedia variant="icon">
                        <Music4Icon/>
                    </EmptyMedia>
                    <EmptyTitle class="text-muted-foreground text-sm">
                        No streamed tracks yet
                    </EmptyTitle>
                </EmptyHeader>
            </Empty>
        {/if}
    </CardContent>
</Card>
