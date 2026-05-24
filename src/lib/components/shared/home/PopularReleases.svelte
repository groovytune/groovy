<script lang="ts">
    import { resolve } from '$app/paths';
    import { resource } from 'runed';
    import type { GETResponse } from '../../../../routes/(app)/api/discover/chart/likes/releases/+server';
    import { Image } from '$lib/client/image';
    import { ImageFormat } from 'appwrite';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import { releaseTypeNames } from '$lib/helpers/constants';
    import SquareReleaseItem from '../app/release/SquareReleaseItem.svelte';

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

<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
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
        <SquareReleaseItem
            name={release.name}
            description={`${release.user.name} · ${releaseTypeNames[release.type]} · ${release._count.likes} ${release._count.likes === 1 ? 'like' : 'likes'}`}
            explicit={release.explicit}
            coverURL={coverURL}
            href={href}
        />
    {/each}
</div>
