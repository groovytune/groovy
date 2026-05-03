<script lang="ts">
    import { ImageGravity } from 'appwrite';
    import { Appwrite } from '$lib/client/appwrite.js';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio/index.js';
    import ExplicitIcon from '$lib/components/shared/icons/ExplicitIcon.svelte';
    import { Button } from '$lib/components/ui/button/index.js';
    import { resolve } from '$app/paths';
    import { AudioPlayerContext } from '$lib/contexts/player.js';
    import { EllipsisIcon, HeartIcon, ListMusicIcon, PencilIcon, PlayIcon } from '@lucide/svelte';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../../lib/components/ui/dropdown-menu/index.js';
    import PlayerDropdownItems from '../../../../lib/components/shared/app/player/PlayerDropdownItems.svelte';
    import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../lib/components/ui/empty/index.js';
    import ms from 'ms';
    import TrackItem from '../../../../lib/components/shared/app/release/track/TrackItem.svelte';
    import { auth } from '../../../../lib/client/auth.js';

    let { data } = $props();

    const audioPlayer = AudioPlayerContext.get();
    const session = auth.useSession();

    let coverURL = $derived(
        data.release.cover
            ? Appwrite.storage.getFilePreview({
                bucketId: 'image',
                fileId: data.release.cover,
                width: 500,
                height: 500,
                gravity: ImageGravity.Center
            })
            : coverPlaceholder
    );

    let totalDuration = $derived(data.release.tracks.reduce((acc, track) => acc + (track.duration ?? 0), 0));
</script>

<div class="flex flex-col md:flex-row">
    <section class="w-full shrink-0 flex flex-col items-center md:max-w-sm pb-5">
        <div class="p-5 w-full max-w-sm relative">
            <AspectRatio class="w-full rounded-md bg-muted cursor-pointer">
                <img src={coverURL} alt="Release Cover" class="size-full object-cover rounded-md"/>
                <img src={coverURL} alt="Release Cover" class="size-full object-cover absolute -z-10 top-0 left-0 opacity-50 saturate-150 blur-2xl"/>
            </AspectRatio>
        </div>
        <header class="w-full max-w-sm text-center px-5">
            <h1
                class="text-2xl leading-tight font-semibold line-clamp-3"
                style="word-wrap: break-word;"
            >
                {data.release.name}
                {#if data.release.explicit}
                    <ExplicitIcon/>
                {/if}
            </h1>
            <p class="text-sm leading-tight text-muted-foreground">
                {data.release.user.name}
            </p>
            <p
                class="text-xs leading-tight text-muted-foreground/60 line-clamp-2 hover:line-clamp-none mt-2"
                style="word-wrap: break-word;"
                title={data.release.description}
            >
                {data.release.description || ''}
            </p>
            <div class="flex gap-2 justify-center mt-5 max-w-sm px-20">
                <Button
                    variant="outline"
                    size="icon"
                    href={resolve('/(app)/release/[id]/edit/tracks', { id: data.release.id })}
                >
                    <HeartIcon/>
                </Button>
                <Button
                    class="w-full"
                    onclick={async () => {
                        await audioPlayer.replaceQueue(data.release.tracks.toSorted((a, b) => a.position - b.position));
                        await audioPlayer.play();
                    }}
                >
                    <PlayIcon fill="currentColor"/>
                    Play
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        {#snippet child({ props })}
                            <Button {...props} variant="outline" size="icon">
                                <EllipsisIcon/>
                            </Button>
                        {/snippet}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent class="mx-2">
                        {#if $session.data?.user.id === data.release.userId}
                            <DropdownMenuItem>
                                {#snippet child({ props })}
                                    <a {...props} href={resolve('/(app)/release/[id]/edit', { id: data.release.id })}>
                                        <PencilIcon/>
                                        Edit Release
                                    </a>
                                {/snippet}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                {#snippet child({ props })}
                                    <a {...props} href={resolve('/(app)/release/[id]/edit/tracks', { id: data.release.id })}>
                                        <ListMusicIcon/>
                                        Manage Tracks
                                    </a>
                                {/snippet}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                        {/if}
                        <PlayerDropdownItems tracks={data.release.tracks.toSorted((a, b) => a.position - b.position)}/>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    </section>
    {#if data.release.tracks.length > 0}
        <section class="py-5 px-2.5 w-full pt-0 md:pt-5">
            <div class="grid gap-2">
                {#each data.release.tracks as track, index (track.id)}
                    <div class="select-none cursor-default min-h-14 flex items-center gap-2">
                        <span class="text-sm text-muted-foreground hidden md:block">
                            {index + 1}
                        </span>
                        <TrackItem
                            track={track}
                            editable={$session.data?.user.id === data.release.userId}
                        />
                    </div>
                {/each}
            </div>
            <div class="text-center pt-5">
                <p class="text-xs text-muted-foreground">
                    {data.release.tracks.length} track{data.release.tracks.length !== 1 ? 's' : ''} • {totalDuration ? ms(totalDuration * 1000, { long: true }) : 'Unknown duration'}
                </p>
            </div>
        </section>
    {:else}
        <div class="flex justify-center w-full" style="content-visibility: auto;">
            <Empty class="bg-muted/50 m-5 py-10 gap-0 min-h-72 max-w-sm lg:max-w-none">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <ListMusicIcon/>
                    </EmptyMedia>
                </EmptyHeader>
                <EmptyTitle>
                    No tracks
                </EmptyTitle>
                <EmptyDescription>
                    This release has no tracks added yet
                </EmptyDescription>
            </Empty>
        </div>
    {/if}
</div>
