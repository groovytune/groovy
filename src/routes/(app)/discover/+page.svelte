<script lang="ts">
    import { ArrowRight, ListMusicIcon, MegaphoneIcon, Music4Icon, StarIcon } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { resolve } from '$app/paths';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import type { GETResponse as GETNewReleases } from '../api/discover/new/releases/+server';
    import { resource } from 'runed';
    import { Image } from '$lib/client/image';
    import { ImageFormat, ImageGravity } from 'appwrite';
    import { ScrollArea } from '$lib/components/ui/scroll-area';
    import { DateTime } from 'luxon';
    import type { GETResponse as GETMostLikedReleases } from '../api/discover/chart/likes/releases/+server';
    import type { GETResponse as GETMostLikedTracks } from '../api/discover/chart/likes/tracks/+server';
    import { numberFormatter } from '$lib/helpers/constants';
    import type { GETResponse as GETPopularArtists } from '../api/discover/chart/followers/artists/+server';
    import ScrollableReleases, { ScrollableItem } from '$lib/components/shared/app/showcase/HorizontallyScrollableItems.svelte';
    import { Skeleton } from '../../../lib/components/ui/skeleton';

    const newReleases = resource(
        () => null,
        async () => {
            const res = await fetch(resolve('/(app)/api/discover/new/releases') + '?limit=20');

            if (!res.ok) {
                throw new Error('Failed to fetch new releases');
            }

            return res.json() as Promise<GETNewReleases>;
        }
    );

    const mostLikedTracks = resource(
        () => null,
        async () => {
            const res = await fetch(resolve('/(app)/api/discover/chart/likes/tracks') + '?take=20');

            if (!res.ok) {
                throw new Error('Failed to fetch most liked tracks');
            }

            return res.json() as Promise<GETMostLikedTracks>;
        }
    );

    const mostLikedReleases = resource(
        () => null,
        async () => {
            const res = await fetch(resolve('/(app)/api/discover/chart/likes/releases') + '?take=20');

            if (!res.ok) {
                throw new Error('Failed to fetch most liked releases');
            }

            return res.json() as Promise<GETMostLikedReleases>;
        }
    );

    const popularArtists = resource(
        () => null,
        async () => {
            const res = await fetch(resolve('/(app)/api/discover/chart/followers/artists') + '?take=20');

            if (!res.ok) {
                throw new Error('Failed to fetch popular artists');
            }

            return res.json() as Promise<GETPopularArtists>;
        }
    );
</script>

{#snippet Chart(title: string, description: string, href: string, background: string, color: string, className: string = '')}
    <Card
        class={["border-transparent", className]}
        style="background: {background}; color: {color}; content-visibility: auto;"
    >
        <CardHeader>
            <CardTitle class="text-current text-2xl font-bold">
                {title}
            </CardTitle>
            <CardDescription class="text-current/50 font-medium">
                {description}
            </CardDescription>
        </CardHeader>
        <CardFooter class="mt-auto">
            <Button
                {href}
                variant="secondary"
                class="bg-white text-black hover:bg-gray-100/90"
            >
                View Chart
                <ArrowRight/>
            </Button>
        </CardFooter>
    </Card>
{/snippet}

<section>
    <h1 class="text-2xl sm:text-4xl font-bold my-4 flex items-center gap-2 px-5">
        <StarIcon class="text-primary size-7 sm:size-8"/>
        Charts
    </h1>
    <ScrollArea orientation="horizontal">
        <div class="md:grid flex md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-auto px-5">
            {@render Chart(
                'Top 100 Tracks',
                'Explore the most popular tracks on Groovy. Discover new music trends and find your next favorite song.',
                resolve('/(app)/discover/chart'),
                'radial-gradient( circle farthest-corner at 10% 20%,  rgba(170,245,248,1) 0%, rgba(248,162,239,0.8) 90% )',
                'black',
                'lg:col-span-2 xl:col-span-1 shrink-0 w-66 md:w-full'
            )}
            {@render Chart(
                'Top Pop Tracks',
                'Whether you\'re a fan of catchy melodies or powerful vocals, our chart has something for every pop enthusiast.',
                resolve('/(app)/discover/chart') + '?genre=pop',
                'linear-gradient( 101.9deg,  rgba(239,151,189,1) -13.9%, rgba(204,239,243,1) 34.6%, rgba(227,241,202,1) 54.2%, rgba(237,187,187,1) 88.6% )',
                'black',
                'md:w-full shrink-0 w-66 md:w-full'
            )}
            {@render Chart(
                'Top Hip Hop Tracks',
                'Explore the hottest hip hop tracks on Groovy. Discover emerging artists and classic hits that define the genre.',
                resolve('/(app)/discover/chart') + '?genre=hiphop',
                'radial-gradient( circle farthest-corner at -8.8% -6.6%,  rgba(255,206,78,1) 0%, rgba(253,169,124,1) 70.1% )',
                'black',
                'shrink-0 w-66 md:w-full'
            )}
            {@render Chart(
                'Top Rock Tracks',
                'Discover the best rock tracks on Groovy. From classic rock anthems to modern hits, our chart has something for every rock fan.',
                resolve('/(app)/discover/chart') + '?genre=rock',
                'linear-gradient( 91.7deg,  rgba(135,206,235,1) 7.3%, rgba(255,154,139,1) 40.3%, rgba(255,195,160,1) 57.9%, rgba(255,215,0,1) 93.5% )',
                'black',
                'lg:col-span-2 xl:col-span-1 shrink-0 w-66 md:w-full'
            )}
        </div>
    </ScrollArea>
</section>
<ScrollableReleases
    title="New Releases"
    icon={MegaphoneIcon}
    items={newReleases.current ?? []}
    loading={newReleases.loading}
    class="mt-10"
>
    {#snippet child({ item })}
        {@render ScrollableItem(
            item.name,
            `${item.user.name} • ${DateTime.fromISO(String(item.createdAt)).toLocaleString(DateTime.DATE_MED)}`,
            item.cover
                ? Image.getPreviewPath({
                    fileId: item.cover,
                    width: 300,
                    height: 300,
                    gravity: ImageGravity.Center,
                    output: ImageFormat.Webp
                })
                : coverPlaceholder,
            item.explicit,
            resolve('/(app)/release/[releaseId]', { releaseId: item.id }),
            resolve('/(app)/artist/[userResolvable]', { userResolvable: item.user.username ? `@${item.user.username}` : item.user.id })
        )}
    {/snippet}
</ScrollableReleases>
<ScrollableReleases
    title="Popular Artists"
    icon={MegaphoneIcon}
    items={popularArtists.current ?? []}
    loading={popularArtists.loading}
    class="mt-10"
>
    {#snippet child({ item })}
        {@const artistURL = resolve('/(app)/artist/[userResolvable]', { userResolvable: item.username ? `@${item.username}` : item.id })}
        <div class="flex flex-col shrink-0 w-40 gap-2" title={item.name} style="content-visibility: auto;">
            <a href={artistURL}>
                <img src={item.image} alt="Artist" class="size-40 rounded-full object-cover"/>
            </a>
            <div>
                <h2 class="text-lg font-semibold mt-2 line-clamp-2 truncate text-balance text-center">
                    <a href={artistURL}>
                        {item.name}
                    </a>
                </h2>
                <p class="text-sm text-muted-foreground text-center leading-tight">
                    {item.username ? `@${item.username}` : ''}
                </p>
                <p class="text-sm text-muted-foreground/70 text-center leading-tight">
                    {numberFormatter.format(item._count.followers)} follower{item._count.followers !== 1 ? 's' : ''}
                </p>
            </div>
        </div>
    {/snippet}
    {#snippet skeletonItem()}
        {#each { length: 5 }}
            <div class="flex flex-col shrink-0" style="content-visibility: auto;">
                <Skeleton class="size-40 rounded-full"/>
                <div class="mt-2 space-y-2 flex flex-col items-center">
                    <Skeleton class="w-20 h-4"/>
                    <Skeleton class="w-14 h-3"/>
                </div>
            </div>
        {/each}
    {/snippet}
</ScrollableReleases>
<ScrollableReleases
    title="Most Liked Tracks"
    icon={Music4Icon}
    items={mostLikedTracks.current ?? []}
    loading={mostLikedTracks.loading}
    class="mt-10"
>
    {#snippet child({ item })}
        {@render ScrollableItem(
            item.name,
            `${item.release.name} • ${numberFormatter.format(item._count.likes)} like${item._count.likes !== 1 ? 's' : ''}`,
            item.cover || item.release.cover
                ? Image.getPreviewPath({
                    fileId: item.cover || item.release.cover!,
                    width: 300,
                    height: 300,
                    gravity: ImageGravity.Center,
                    output: ImageFormat.Webp
                })
                : coverPlaceholder,
            item.explicit,
            resolve('/(app)/release/[releaseId]/track/[trackId]', { releaseId: item.releaseId, trackId: item.id }),
            resolve('/(app)/release/[releaseId]', { releaseId: item.releaseId })
        )}
    {/snippet}
</ScrollableReleases>
<ScrollableReleases
    title="Most Liked Releases"
    icon={ListMusicIcon}
    items={mostLikedReleases.current ?? []}
    loading={mostLikedReleases.loading}
    class="mt-10"
>
    {#snippet child({ item })}
        {@render ScrollableItem(
            item.name,
            `${item.user.name} • ${numberFormatter.format(item._count.likes)} like${item._count.likes !== 1 ? 's' : ''}`,
            item.cover
                ? Image.getPreviewPath({
                    fileId: item.cover,
                    width: 300,
                    height: 300,
                    gravity: ImageGravity.Center,
                    output: ImageFormat.Webp
                })
                : coverPlaceholder,
            item.explicit,
            resolve('/(app)/release/[releaseId]', { releaseId: item.id }),
            resolve('/(app)/artist/[userResolvable]', { userResolvable: item.user.username ? `@${item.user.username}` : item.user.id })
        )}
    {/snippet}
</ScrollableReleases>
