<script lang="ts">
    import { ArrowRight, MegaphoneIcon, StarIcon } from '@lucide/svelte';
    import { Button } from '../../../lib/components/ui/button';
    import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../lib/components/ui/card';
    import { resolve } from '$app/paths';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import type { GETResponse } from '../api/discover/new/releases/+server';
    import { resource } from 'runed';
    import { Image } from '../../../lib/client/image';
    import { ImageFormat, ImageGravity } from 'appwrite';
    import ExplicitIcon from '../../../lib/components/shared/icons/ExplicitIcon.svelte';
    import { ScrollArea } from '../../../lib/components/ui/scroll-area';
    import { DateTime } from 'luxon';

    const newReleases = resource(
        () => null,
        async () => {
            const res = await fetch(resolve('/api/discover/new/releases') + '?limit=50');

            if (!res.ok) {
                throw new Error('Failed to fetch new releases');
            }

            return res.json() as Promise<GETResponse>;
        }
    );
</script>

{#snippet Chart(title: string, description: string, href: string, background: string, color: string, className: string = '')}
    <Card
        class={["border-transparent", className]}
        style="background: {background}; color: {color};"
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

<section class="px-5">
    <h1 class="text-2xl sm:text-4xl font-bold my-4 flex items-center gap-2">
        <StarIcon class="text-primary size-7 sm:size-8"/>
        Charts
    </h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {@render Chart(
            'Top 100 Tracks',
            'Explore the most popular tracks on Groovy. Discover new music trends and find your next favorite song.',
            resolve('/(app)/discover/chart'),
            'radial-gradient( circle farthest-corner at 10% 20%,  rgba(170,245,248,1) 0%, rgba(248,162,239,0.8) 90% )',
            'black',
            'lg:col-span-2 xl:col-span-1'
        )}
        {@render Chart(
            'Top Pop Tracks',
            'Whether you\'re a fan of catchy melodies or powerful vocals, our chart has something for every pop enthusiast.',
            resolve('/(app)/discover/chart') + '?genre=pop',
            'linear-gradient( 101.9deg,  rgba(239,151,189,1) -13.9%, rgba(204,239,243,1) 34.6%, rgba(227,241,202,1) 54.2%, rgba(237,187,187,1) 88.6% )',
            'black'
        )}
        {@render Chart(
            'Top Hip Hop Tracks',
            'Explore the hottest hip hop tracks on Groovy. Discover emerging artists and classic hits that define the genre.',
            resolve('/(app)/discover/chart') + '?genre=hiphop',
            'radial-gradient( circle farthest-corner at -8.8% -6.6%,  rgba(255,206,78,1) 0%, rgba(253,169,124,1) 70.1% )',
            'black'
        )}
        {@render Chart(
            'Top Rock Tracks',
            'Discover the best rock tracks on Groovy. From classic rock anthems to modern hits, our chart has something for every rock fan.',
            resolve('/(app)/discover/chart') + '?genre=rock',
            'linear-gradient( 91.7deg,  rgba(135,206,235,1) 7.3%, rgba(255,154,139,1) 40.3%, rgba(255,195,160,1) 57.9%, rgba(255,215,0,1) 93.5% )',
            'black',
            'lg:col-span-2 xl:col-span-1'
        )}
    </div>
</section>
<section class="mt-10">
    <h1 class="text-2xl sm:text-4xl font-bold my-4 flex items-center gap-2 px-5">
        <MegaphoneIcon class="text-primary size-7 sm:size-8"/>
        New Releases
    </h1>
    <div class="pb-10">
        {#if newReleases.loading}
            please wait...
        {:else if newReleases.current?.length}
            <ScrollArea orientation="horizontal">
                <div class="flex gap-4 px-5">
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
                        <div class="flex flex-col shrink-0 w-40 sm:w-80" title={release.name}>
                            <a href={releaseURL}>
                                <img src={coverURL} alt="Album Cover" class="size-40 sm:size-80 rounded-md object-cover"/>
                            </a>
                            <div>
                                <h2 class="sm:text-lg text-sm font-semibold mt-2 line-clamp-2 truncate text-balance">
                                    <a href={releaseURL}>
                                        {release.name}
                                        {#if release.explicit}
                                            <ExplicitIcon class="size-4 sm:size-5"/>
                                        {/if}
                                    </a>
                                </h2>
                                <p class="text-xs sm:text-sm text-muted-foreground line-clamp-2 truncate text-balance">
                                    <a href={resolve('/(app)/artist/[userResolvable]', { userResolvable: release.user.username ? `@${release.user.username}` : release.user.id })}>
                                        {release.user.name} • {DateTime.fromISO(String(release.createdAt)).toLocaleString(DateTime.DATE_MED)}
                                    </a>
                                </p>
                            </div>
                        </div>
                    {/each}
                </div>
            </ScrollArea>
        {/if}
    </div>
</section>
