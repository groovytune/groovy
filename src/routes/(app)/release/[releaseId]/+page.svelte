<script lang="ts">
    import { ImageFormat } from 'appwrite';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio';
    import ExplicitIcon from '$lib/components/shared/icons/ExplicitIcon.svelte';
    import { Button } from '$lib/components/ui/button';
    import { resolve } from '$app/paths';
    import { Disc3Icon, EllipsisIcon, ListMusicIcon, PencilIcon, PlayIcon, Share2Icon } from '@lucide/svelte';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import PlayerDropdownItems from '$lib/components/shared/app/player/PlayerDropdownItems.svelte';
    import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '$lib/components/ui/empty';
    import ms from 'ms';
    import TrackItem from '$lib/components/shared/app/release/track/TrackItem.svelte';
    import { auth } from '$lib/client/auth.js';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte.js';
    import ShareButton from '$lib/components/shared/app/release/ShareButton.svelte';
    import { Image } from '$lib/client/image.js';
    import LikeButton from '$lib/components/shared/app/LikeButton.svelte';
    import { createUserProfileURL } from '$lib/helpers/utils.js';

    let { data } = $props();

    const audioPlayer = AudioPlayer.context.get();
    const session = auth.useSession();

    let tracks = $derived(data.release.tracks.toSorted((a, b) => a.position - b.position));

    let coverURL = $derived(
        data.release.cover
            ? Image.getPreviewPath({
                fileId: data.release.cover,
                width: 500,
                height: 500,
                output: ImageFormat.Webp
            })
            : coverPlaceholder
    );

    let totalDuration = $derived(tracks.reduce((acc, track) => acc + (track.duration ?? 0), 0));
</script>

<div class="flex flex-col md:flex-row">
    <section class="w-full shrink-0 flex flex-col items-center md:max-w-sm pb-5">
        <div class="p-5 w-full max-w-sm relative">
            <AspectRatio class="w-full rounded-md bg-muted cursor-pointer">
                <img src={coverURL} alt={data.release.name} class="size-full object-cover rounded-md"/>
                <img src={coverURL} alt={data.release.name} class="size-full object-cover absolute -z-10 top-0 left-0 opacity-50 saturate-150 blur-2xl"/>
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
                <LikeButton itemId={data.release.id} itemType="release"/>
                <Button
                    class="w-full"
                    onclick={async () => {
                        await audioPlayer.replaceQueue(tracks);
                        await audioPlayer.play();
                    }}
                >
                    <PlayIcon/>
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
                    <DropdownMenuContent class="mx-2 min-w-40">
                        <PlayerDropdownItems tracks={tracks.toSorted((a, b) => a.position - b.position)}/>
                        {#if $session.data?.user.id === data.release.userId}
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem>
                                {#snippet child({ props })}
                                    <a {...props} href={resolve('/(app)/release/[releaseId]/edit', { releaseId: data.release.id })}>
                                        <PencilIcon/>
                                        Edit Release
                                    </a>
                                {/snippet}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                {#snippet child({ props })}
                                    <a {...props} href={resolve('/(app)/release/[releaseId]/edit/tracks', { releaseId: data.release.id })}>
                                        <ListMusicIcon/>
                                        Manage Tracks
                                    </a>
                                {/snippet}
                            </DropdownMenuItem>
                        {/if}
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem>
                            {#snippet child({ props })}
                                <a
                                    {...props}
                                    href={createUserProfileURL(data.release.user)}
                                >
                                    <Disc3Icon/>
                                    View Artist
                                </a>
                            {/snippet}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            {#snippet child({ props })}
                                <ShareButton
                                    data={{
                                        title: data.release.name,
                                        url: new URL(resolve('/(app)/release/[releaseId]', { releaseId: data.release.id }), location.origin).href
                                    }}
                                >
                                    {#snippet child({ onclick })}
                                        <a {...props} onclick={onclick}>
                                            <Share2Icon/>
                                            Share
                                        </a>
                                    {/snippet}
                                </ShareButton>
                            {/snippet}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    </section>
    {#if data.release.tracks.length > 0}
        <section class="py-5 px-2.5 w-full pt-0 md:pt-5">
            <div class="flex flex-col gap-2">
                {#each tracks as track, index (track.id)}
                    <div class="select-none cursor-default min-h-14 flex items-center gap-2">
                        <span class="text-sm text-muted-foreground hidden md:block">
                            {index + 1}
                        </span>
                        <TrackItem
                            track={track}
                            editable={$session.data?.user.id === data.release.userId}
                            onclick={async () => {
                                const newQueue = tracks.toSpliced(0, index);
                                const newHistory = tracks.toSpliced(index).reverse();
                                await audioPlayer.replaceQueue(newQueue, newHistory);
                                await audioPlayer.play();
                            }}
                            ondelete={() => {
                                data.release.tracks = tracks = tracks.filter(t => t.id !== track.id);
                            }}
                        />
                    </div>
                {/each}
            </div>
            <div class="text-center pt-5">
                <p class="text-xs text-muted-foreground">
                    {tracks.length} track{tracks.length !== 1 ? 's' : ''} • {totalDuration ? ms(totalDuration * 1000, { long: true }) : 'Unknown duration'}
                </p>
            </div>
        </section>
    {:else}
        <div class="flex justify-center w-full">
            <Empty class="m-5 py-10 gap-0">
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
