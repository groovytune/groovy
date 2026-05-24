<script lang="ts">
    import { Disc3Icon } from '@lucide/svelte';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
    import type { PartialUser } from '../../../../helpers/utils';
    import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../ui/empty';
    import SquareReleaseItem from '../release/SquareReleaseItem.svelte';
    import { resolve } from '$app/paths';
    import { onMount } from 'svelte';
    import type { Release } from '../../../../server/prisma/browser';
    import { Image } from '../../../../client/image';
    import { ImageFormat } from 'appwrite';
    import { releaseTypeNames } from '../../../../helpers/constants';
    import { DateTime } from 'luxon';
    import { Skeleton } from '../../../ui/skeleton';
    import { Button } from '../../../ui/button';

    let {
        user
    }: {
        user: PartialUser;
    } = $props();

    let releases: Release[] = $state([]);
    let isLoading = $state(false);
    let isAtEnd = $state(false);

    async function fetchReleases() {
        isLoading = true;

        const lastRelease = releases.at(-1)?.id;
        const take = 20;
        const response = await fetch(resolve('/(app)/api/artist/[artistId]/releases', { artistId: user.id }) + `?take=${take}${lastRelease ? '&after=' + lastRelease : ''}`)
            .then(res => res.ok
                ? res.json() as Promise<Release[]>
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

        releases.push(...response);
        isAtEnd = response.length === 0 || response.length < take;
    }

    onMount(() => {
        fetchReleases();
    });
</script>

<Card>
    <CardHeader>
        <CardTitle class="flex items-center gap-1">
            <Disc3Icon class="size-5 -mt-1 text-primary"/>
            Releases
        </CardTitle>
        <CardDescription>
            All releases by {user.name}
        </CardDescription>
    </CardHeader>
    <CardContent class="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {#each releases as release (release.id)}
            {@const coverURL = release.cover
                ? Image.getPreviewPath({
                    fileId: release.cover,
                    width: 300,
                    height: 300,
                    output: ImageFormat.Webp
                })
                : undefined
            }
            <SquareReleaseItem
                name={release.name}
                description={`${releaseTypeNames[release.type]} · ${DateTime.fromJSDate(new Date(release.createdAt)).toFormat('MMM dd')}`}
                explicit={release.explicit}
                coverURL={coverURL}
                href={resolve('/(app)/release/[releaseId]', { releaseId: release.id })}
            />
        {/each}
        {#if isLoading}
            {#each { length: 6 }}
                <Skeleton class="aspect-square w-full rounded-md last:odd:hidden"/>
            {/each}
        {:else if isAtEnd && releases.length === 0}
            <Empty class="col-span-full">
                <EmptyHeader class="gap-0">
                    <EmptyMedia variant="icon">
                        <Disc3Icon/>
                    </EmptyMedia>
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
