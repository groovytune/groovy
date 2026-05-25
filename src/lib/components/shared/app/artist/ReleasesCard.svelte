<script lang="ts">
    import { Disc3Icon, type IconProps } from '@lucide/svelte';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
    import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '$lib/components/ui/empty';
    import SquareReleaseItem from '../release/SquareReleaseItem.svelte';
    import { resolve } from '$app/paths';
    import { onMount, type Component } from 'svelte';
    import type { Release } from '$lib/server/prisma/browser';
    import { Image } from '$lib/client/image';
    import { ImageFormat } from 'appwrite';
    import { releaseTypeNames } from '$lib/helpers/constants';
    import { DateTime } from 'luxon';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import { Button } from '$lib/components/ui/button';

    let {
        user,
        title = 'Releases',
        description = `All releases by ${user.name}`,
        icon = Disc3Icon,
        class: className = '',
        route = resolve('/(app)/api/artist/[artistId]/releases', { artistId: user.id }),
        take = 20
    }: {
        user: { id: string; name: string; };
        title?: string;
        description?: string;
        icon?: Component<IconProps>;
        class?: string;
        route?: string;
        take?: number;
    } = $props();

    let releases: Release[] = $state([]);
    let isLoading = $state(false);
    let isAtEnd = $state(false);

    async function fetchReleases() {
        isLoading = true;

        const lastRelease = releases.at(-1)?.id;
        const response = await fetch(route + `?take=${take}${lastRelease ? '&after=' + lastRelease : ''}`)
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
