<script lang="ts">
    import type { GETResponse as MostLikedReleases } from '../../../../../routes/(app)/api/discover/chart/likes/releases/+server';
    import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Button } from '$lib/components/ui/button';
    import { resolve } from '$app/paths';
    import { Image } from '$lib/client/image';
    import { ImageFormat } from 'appwrite';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import { resource } from 'runed';

    const releases = resource(
        [],
        async () => {
            const response = await fetch(resolve('/(app)/api/discover/chart/likes/releases') + '?take=3');

            if (!response.ok) {
                throw new Error('Failed to fetch most liked releases');
            }

            return response.json() as Promise<MostLikedReleases>;
        }
    );
</script>

<Card>
    <CardHeader>
        <CardTitle>
            Discover
        </CardTitle>
        <CardDescription>
            Explore a world of creativity inspired by music.
        </CardDescription>
        <CardAction>
            <Button href={resolve('/(app)/discover')} variant="outline" size="sm">
                View All
            </Button>
        </CardAction>
    </CardHeader>
    <CardContent>
            <div class="grid grid-cols-3 gap-2">
                {#each releases.current as release (release.id)}
                    {@const coverURL = release.cover
                        ? Image.getPreviewPath({
                            fileId: release.cover,
                            width: 300,
                            height: 300,
                            output: ImageFormat.Webp
                        })
                        : coverPlaceholder}
                    <a
                        href={resolve('/(app)/release/[releaseId]', { releaseId: release.id })}
                        class="flex flex-col text-center"
                    >
                        <img src={coverURL} alt={release.name} class="w-full aspect-square rounded-md object-cover mb-2"/>
                        <p class="text-sm font-medium line-clamp-1">{release.name}</p>
                        <p class="text-xs text-muted-foreground line-clamp-1">{release.user.name}</p>
                    </a>
                {/each}
            </div>
    </CardContent>
</Card>
