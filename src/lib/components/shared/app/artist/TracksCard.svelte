<script lang="ts">
    import { MusicIcon, type IconProps } from '@lucide/svelte';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
    import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '$lib/components/ui/empty';
    import SquareReleaseItem from '../release/SquareReleaseItem.svelte';
    import { resolve } from '$app/paths';
    import { onMount, type Component } from 'svelte';
    import type { Release, Track } from '$lib/server/prisma/browser';
    import { Image } from '$lib/client/image';
    import { ImageFormat } from 'appwrite';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import { Button } from '$lib/components/ui/button';
    import { formatDuration } from '$lib/helpers/utils';

    let {
        title = 'Tracks',
        description,
        icon = MusicIcon,
        class: className = '',
        route = resolve('/(app)/api/liked/tracks'),
        take = 20
    }: {
        title?: string;
        description?: string;
        icon?: Component<IconProps>;
        class?: string;
        route?: string;
        take?: number;
    } = $props();

    let tracks: TrackData[] = $state([]);
    let isLoading = $state(false);
    let isAtEnd = $state(false);

    async function fetchReleases() {
        isLoading = true;

        const lastTrack = tracks.at(-1)?.id;
        const response = await fetch(route + `?take=${take}${lastTrack ? '&after=' + lastTrack : ''}`)
            .then(res => res.ok
                ? res.json() as Promise<TrackData[]>
                : Promise.reject(res)
            )
            .catch(err => {
                console.error('Failed to load releases:', err);
                return null;
            })
            .finally(() => {
                isLoading = false;
            });

        if (!response) return;

        tracks.push(...response);
        isAtEnd = response.length === 0 || response.length < take;
    }

    onMount(() => {
        fetchReleases();
    });
</script>

<script lang="ts" module>
    export type TrackData = Track & {
        release: Pick<Release, 'id'|'name'|'cover'>;
    }
</script>

<Card>
    <CardHeader>
        <CardTitle class="flex items-center gap-1">
            {#if icon}
                {@const Icon = icon}
                <Icon class="size-5 -mt-1 text-primary"/>
            {/if}
            {title}
        </CardTitle>
        <CardDescription>
            {description}
        </CardDescription>
    </CardHeader>
    <CardContent class={["grid grid-cols-2 lg:grid-cols-3 gap-2", className]}>
        {#each tracks as track (track.id)}
            {@const coverURL = track.cover || track.release?.cover
                ? Image.getPreviewPath({
                    fileId: track.cover || track.release.cover!,
                    width: 300,
                    height: 300,
                    output: ImageFormat.Webp
                })
                : undefined
            }
            <SquareReleaseItem
                name={track.name}
                description={`${track.duration ? formatDuration(track.duration) + ' · ' : ''}${track.release.name}`}
                explicit={track.explicit}
                coverURL={coverURL}
                href={resolve('/(app)/release/[releaseId]/track/[trackId]', { releaseId: track.release.id, trackId: track.id })}
            />
        {/each}
        {#if isLoading}
            {#each { length: 6 }}
                <Skeleton class="aspect-square w-full rounded-md last:odd:hidden"/>
            {/each}
        {:else if isAtEnd && tracks.length === 0}
            <Empty class="col-span-full">
                <EmptyHeader class="gap-0">
                    {#if icon}
                        {@const Icon = icon}
                        <EmptyMedia variant="icon">
                            <Icon/>
                        </EmptyMedia>
                    {/if}
                    <EmptyTitle class="text-muted-foreground text-sm">
                        No releases yet
                    </EmptyTitle>
                </EmptyHeader>
            </Empty>
        {:else if !isAtEnd}
            <div class="flex items-center justify-center border rounded-md">
                <Button
                    variant="outline"
                    onclick={fetchReleases}
                >
                    Load More
                </Button>
            </div>
        {/if}
    </CardContent>
</Card>
