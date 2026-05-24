<script lang="ts">
    import { page } from '$app/state';
    import { Disc3Icon, LoaderIcon, Music4Icon, SearchIcon, UsersRoundIcon } from '@lucide/svelte';
    import z from 'zod';
    import { InputGroup, InputGroupAddon, InputGroupInput } from '$lib/components/ui/input-group';
    import { goto } from '$app/navigation';
    import { resource } from 'runed';
    import Button from '$lib/components/ui/button/button.svelte';
    import { resolve } from '$app/paths';
    import type { Post, Release, Track } from '../../../lib/server/prisma/browser';
    import type { PartialUser } from '../../../lib/helpers/utils';
    import TrackItem from '../../../lib/components/shared/app/release/track/TrackItem.svelte';
    import SquareReleaseItem from '../../../lib/components/shared/app/release/SquareReleaseItem.svelte';
    import { releaseTypeNames } from '../../../lib/helpers/constants';
    import { DateTime } from 'luxon';
    import { Image } from '../../../lib/client/image';
    import { ImageFormat } from 'appwrite';

    let query = $derived(page.url.searchParams.get('q') ?? '');
    let type = $derived(z.literal(['tracks','releases','artists','posts']).safeParse(page.url.searchParams.get('type')).data || 'artists');

    const results = resource(
        [() => query, () => type],
        async ([query, type]) => {
            if (!query) return null;

            const queries = `?q=${encodeURIComponent(query)}`;

            let res: Response;

            switch (type) {
                case 'tracks':
                    res = await fetch(resolve('/api/search/tracks') + queries);
                    break;
                case 'releases':
                    res = await fetch(resolve('/api/search/releases') + queries);
                    break;
                case 'artists':
                    res = await fetch(resolve('/api/search/artists') + queries);
                    break;
                case 'posts':
                    res = await fetch(resolve('/api/search/posts') + queries);
                    break;
            }

            if (!res.ok) {
                throw new Error('Failed to fetch search results');
            }

            return { type, data: await res.json() } as SearchResult;
        },
        {
            debounce: 300
        }
    );
</script>

<script lang="ts" module>
    export type SearchResult = TracksResult | ReleasesResult | ArtistsResult | PostsResult;

    export type TracksResult = { type: 'tracks'; data: Track[]; };
    export type ReleasesResult = { type: 'releases'; data: Release[]; };
    export type ArtistsResult = { type: 'artists'; data: PartialUser[]; };
    export type PostsResult = { type: 'posts'; data: Post[]; };
</script>

<h1 class="text-2xl sm:text-4xl font-bold my-4 px-5 flex items-center gap-2">
    <SearchIcon class="text-primary size-7 sm:size-8"/>
    {#if results.current && !results.loading}
        {results.current.data.length} {type} found
    {:else}
        Search for <span class="capitalize">{type}</span>
    {/if}
</h1>
<section class="flex flex-col p-5 gap-5">
    <div class="flex flex-col gap-2">
        <InputGroup>
            <InputGroupInput
                bind:value={query}
                autofocus
                placeholder="Search for {type}..."
                onkeydown={e => {
                    if (e.key === 'Enter') {
                        // eslint-disable-next-line svelte/no-navigation-without-resolve
                        goto(`?q=${encodeURIComponent(query)}&type=${type}`);
                    }
                }}
            />
            <InputGroupAddon align="inline-start">
                {#if results.loading}
                    <LoaderIcon class="animate-spin"/>
                {:else}
                    <SearchIcon/>
                {/if}
            </InputGroupAddon>
        </InputGroup>
        <div class="flex gap-2 flex-wrap">
            <Button
                variant="outline"
                class={[
                    "rounded-lg",
                    type == "tracks" && "text-primary! bg-primary/10! border-primary/20!"
                ]}
                onclick={() =>
                    // eslint-disable-next-line svelte/no-navigation-without-resolve
                    goto(`?q=${encodeURIComponent(query)}&type=tracks`)
                }
            >
                <Music4Icon/>
                Tracks
            </Button>
            <Button
                variant="outline"
                class={[
                    "rounded-lg",
                    type == "releases" && "text-primary! bg-primary/10! border-primary/20!"
                ]}
                onclick={() =>
                    // eslint-disable-next-line svelte/no-navigation-without-resolve
                    goto(`?q=${encodeURIComponent(query)}&type=releases`)
                }
            >
                <Disc3Icon/>
                Releases
            </Button>
            <Button
                variant="outline"
                class={[
                    "rounded-lg",
                    type == "artists" && "text-primary! bg-primary/10! border-primary/20!"
                ]}
                onclick={() =>
                    // eslint-disable-next-line svelte/no-navigation-without-resolve
                    goto(`?q=${encodeURIComponent(query)}&type=artists`)
                }
            >
                <UsersRoundIcon/>
                Artists
            </Button>
            <Button
                variant="outline"
                class={[
                    "rounded-lg",
                    type == "posts" && "text-primary! bg-primary/10! border-primary/20!"
                ]}
                onclick={() =>
                    // eslint-disable-next-line svelte/no-navigation-without-resolve
                    goto(`?q=${encodeURIComponent(query)}&type=posts`)
                }
            >
                <UsersRoundIcon/>
                Posts
            </Button>
        </div>
    </div>
    <div class="flex flex-col gap-4">
        {#if results.current?.data.length && !results.loading}
            {#if results.current.type === 'tracks'}
                {#each results.current.data as track, index (track.id)}
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
            {:else if results.current.type === 'releases'}
                <div class="size-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {#each results.current.data as release (release.id)}
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
                            explicit={release.explicit}
                            description={`${releaseTypeNames[release.type]} · ${DateTime.fromJSDate(new Date(release.createdAt)).toLocaleString(DateTime.DATE_MED)}`}
                            href={resolve('/(app)/release/[releaseId]', { releaseId: release.id })}
                            {coverURL}
                        />
                        <SquareReleaseItem
                            name={release.name}
                            explicit={release.explicit}
                            description={`${releaseTypeNames[release.type]} · ${DateTime.fromJSDate(new Date(release.createdAt)).toLocaleString(DateTime.DATE_MED)}`}
                            href={resolve('/(app)/release/[releaseId]', { releaseId: release.id })}
                            {coverURL}
                        />
                        <SquareReleaseItem
                            name={release.name}
                            explicit={release.explicit}
                            description={`${releaseTypeNames[release.type]} · ${DateTime.fromJSDate(new Date(release.createdAt)).toLocaleString(DateTime.DATE_MED)}`}
                            href={resolve('/(app)/release/[releaseId]', { releaseId: release.id })}
                            {coverURL}
                        />
                        <SquareReleaseItem
                            name={release.name}
                            explicit={release.explicit}
                            description={`${releaseTypeNames[release.type]} · ${DateTime.fromJSDate(new Date(release.createdAt)).toLocaleString(DateTime.DATE_MED)}`}
                            href={resolve('/(app)/release/[releaseId]', { releaseId: release.id })}
                            {coverURL}
                        />
                    {/each}
                </div>
            {:else if results.current.type === 'artists'}
                {#each results.current.data as artist (artist.id)}
                {/each}
            {:else if results.current.type === 'posts'}
                {#each results.current.data as post (post.id)}
                {/each}
            {/if}
        {/if}
    </div>
</section>
