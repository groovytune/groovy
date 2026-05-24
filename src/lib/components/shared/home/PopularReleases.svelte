<script lang="ts">
    import { resolve } from '$app/paths';
    import { resource } from 'runed';
    import type { GETResponse } from '../../../../routes/(app)/api/discover/chart/likes/releases/+server';
    import { Image } from '$lib/client/image';
    import { ImageFormat } from 'appwrite';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import ExplicitIcon from '../icons/ExplicitIcon.svelte';

    const releases = resource(
        [],
        async () => {
            const response = await fetch(resolve('/api/discover/chart/likes/releases') + '?take=4');

            if (!response.ok) {
                throw new Error('Failed to fetch popular releases');
            }

            return response.json() as Promise<GETResponse>;
        }
    )
</script>

<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full bg-card border text-card-foreground rounded-lg p-4">
    {#each releases.current as release (release.id)}
        {@const coverURL = release.cover
            ? Image.getPreviewPath({
                fileId: release.cover,
                width: 300,
                height: 300,
                output: ImageFormat.Webp
            })
            : coverPlaceholder}
        {@const href = resolve('/(app)/release/[releaseId]', { releaseId: release.id })}
        <a {href} class="flex flex-col shrink-0" style="content-visibility: auto;">
            <img src={coverURL} alt={release.name} class="aspect-square w-full bg-muted rounded-md object-cover"/>
            <div class="absolute bottom-0 z-10 p-5 w-full flex flex-col">
                <p class="text-white/80 text-sm leading-tight">
                    {release.user.name} &middot; {release._count.likes} {release._count.likes === 1 ? 'like' : 'likes'}
                </p>
                <h3 class="font-semibold text-lg">
                    {release.name}
                    {#if release.explicit}
                        <ExplicitIcon class="inline-block size-5"/>
                    {/if}
                </h3>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-full bg-linear-to-t from-black/40 to-transparent z-0"></div>
        </a>
    {/each}
</div>
