<script lang="ts">
    import { ArrowRight, ListMusicIcon, MegaphoneIcon, Music4Icon, StarIcon } from '@lucide/svelte';
    import { Button } from '../../../lib/components/ui/button';
    import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../lib/components/ui/card';
    import { resolve } from '$app/paths';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import type { GETResponse as GETNewReleases } from '../api/discover/new/releases/+server';
    import { resource } from 'runed';
    import { Image } from '../../../lib/client/image';
    import { ImageFormat, ImageGravity } from 'appwrite';
    import ExplicitIcon from '../../../lib/components/shared/icons/ExplicitIcon.svelte';
    import { ScrollArea } from '../../../lib/components/ui/scroll-area';
    import { DateTime } from 'luxon';
    import type { GETResponse as GETMostLikedReleases } from '../api/chart/likes/releases/+server';
    import type { GETResponse as GETMostLikedTracks } from '../api/chart/likes/tracks/+server';
    import { numberFormatter } from '../../../lib/helpers/constants';
    import Skeleton from '../../../lib/components/ui/skeleton/skeleton.svelte';

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
            const res = await fetch(resolve('/(app)/api/chart/likes/tracks') + '?take=20');

            if (!res.ok) {
                throw new Error('Failed to fetch most liked tracks');
            }

            return res.json() as Promise<GETMostLikedTracks>;
        }
    );

    const mostLikedReleases = resource(
        () => null,
        async () => {
            const res = await fetch(resolve('/(app)/api/chart/likes/releases') + '?take=20');

            if (!res.ok) {
                throw new Error('Failed to fetch most liked releases');
            }

            return res.json() as Promise<GETMostLikedReleases>;
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

{#snippet Item(name: string, description: string, coverURL: string, explicit: boolean, href: string, descriptionHref?: string)}
    <div class="flex flex-col shrink-0 w-40 sm:w-80" title={name} style="content-visibility: auto;">
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a href={href}>
            <img src={coverURL} alt="Album Cover" class="size-40 sm:size-80 rounded-md object-cover"/>
        </a>
        <div>
            <h2 class="sm:text-lg text-sm font-semibold mt-2 line-clamp-2 truncate text-balance">
                <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                <a href={href}>
                    {name}
                    {#if explicit}
                        <ExplicitIcon class="size-4 sm:size-5"/>
                    {/if}
                </a>
            </h2>
            <p class="text-xs sm:text-sm text-muted-foreground line-clamp-2 truncate text-balance">
                <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                <a href={descriptionHref ?? href}>
                    {description}
                </a>
            </p>
        </div>
    </div>
{/snippet}

{#snippet ItemSkeletons(length: number = 5)}
    {#each { length }}
        <div class="flex flex-col shrink-0" style="content-visibility: auto;">
            <Skeleton class="size-40 sm:size-80"/>
            <div class="mt-2 space-y-2">
                <Skeleton class="w-20 sm:w-48 h-4"/>
                <Skeleton class="w-14 sm:w-40 h-3"/>
            </div>
        </div>
    {/each}
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
<section class="mt-10">
    <h1 class="text-2xl sm:text-4xl font-bold my-4 flex items-center gap-2 px-5">
        <MegaphoneIcon class="text-primary size-7 sm:size-8"/>
        New Releases
    </h1>
    <div class="pb-5">
        <ScrollArea orientation="horizontal">
            <div class="flex gap-4 px-5">
                {#if newReleases.loading}
                    {@render ItemSkeletons()}
                {:else if newReleases.current?.length}
                    {#each newReleases.current as release (release.id)}
                        {@const releaseURL = resolve('/(app)/release/[releaseId]', { releaseId: release.id })}
                        {@const coverURL = release.cover
                            ? Image.getPreviewPath({
                                fileId: release.cover,
                                width: 300,
                                height: 300,
                                gravity: ImageGravity.Center,
                                output: ImageFormat.Webp
                            })
                            : coverPlaceholder
                        }
                        {@render Item(
                            release.name,
                            `${release.user.name} • ${DateTime.fromISO(String(release.createdAt)).toLocaleString(DateTime.DATE_MED)}`,
                            coverURL,
                            release.explicit,
                            releaseURL,
                            resolve('/(app)/artist/[userResolvable]', { userResolvable: release.user.username ? `@${release.user.username}` : release.user.id })
                        )}
                    {/each}
                {/if}
            </div>
        </ScrollArea>
    </div>
</section>
<section>
    <h1 class="text-2xl sm:text-4xl font-bold my-4 flex items-center gap-2 px-5">
        <Music4Icon class="text-primary size-7 sm:size-8"/>
        Most Liked Tracks
    </h1>
    <div class="pb-5">
        <ScrollArea orientation="horizontal">
            <div class="flex gap-4 px-5">
                {#if mostLikedTracks.loading}
                    {@render ItemSkeletons()}
                {:else if mostLikedTracks.current?.length}
                    {#each mostLikedTracks.current as track (track.id)}
                        {@const trackURL = resolve('/(app)/release/[releaseId]/track/[trackId]', { releaseId: track.release.id, trackId: track.id })}
                        {@const coverURL = track.cover || track.release.cover
                            ? Image.getPreviewPath({
                                fileId: track.cover || track.release.cover!,
                                width: 300,
                                height: 300,
                                gravity: ImageGravity.Center,
                                output: ImageFormat.Webp
                            })
                            : coverPlaceholder
                        }
                        {@render Item(
                            track.name,
                            `${track.release.name} • ${numberFormatter.format(track._count.likes)} like${track._count.likes !== 1 ? 's' : ''}`,
                            coverURL,
                            track.explicit,
                            trackURL,
                            resolve('/(app)/release/[releaseId]', { releaseId: track.release.id })
                        )}
                    {/each}
                {/if}
            </div>
        </ScrollArea>
    </div>
</section>
<section>
    <h1 class="text-2xl sm:text-4xl font-bold my-4 flex items-center gap-2 px-5">
        <ListMusicIcon class="text-primary size-7 sm:size-8"/>
        Most Liked Releases
    </h1>
    <div class="pb-10">
        <ScrollArea orientation="horizontal">
            <div class="flex gap-4 px-5">
                {#if mostLikedReleases.loading}
                    {@render ItemSkeletons()}
                {:else if mostLikedReleases.current?.length}
                    {#each mostLikedReleases.current as release (release.id)}
                        {@const releaseURL = resolve('/(app)/release/[releaseId]', { releaseId: release.id })}
                        {@const coverURL = release.cover
                            ? Image.getPreviewPath({
                                fileId: release.cover,
                                width: 300,
                                height: 300,
                                gravity: ImageGravity.Center,
                                output: ImageFormat.Webp
                            })
                            : coverPlaceholder
                        }
                        {@render Item(
                            release.name,
                            `${release.user.name} • ${numberFormatter.format(release._count.likes)} like${release._count.likes !== 1 ? 's' : ''}`,
                            coverURL,
                            release.explicit,
                            releaseURL,
                            resolve('/(app)/artist/[userResolvable]', { userResolvable: release.user.username ? `@${release.user.username}` : release.user.id })
                        )}
                    {/each}
                {/if}
            </div>
        </ScrollArea>
    </div>
</section>
