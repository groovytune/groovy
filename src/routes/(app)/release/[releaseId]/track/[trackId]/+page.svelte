<script lang="ts">
    import { ImageFormat, ImageGravity } from 'appwrite';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import { Image } from '$lib/client/image.js';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio';
    import ExplicitIcon from '$lib/components/shared/icons/ExplicitIcon.svelte';
    import { Button } from '$lib/components/ui/button';
    import { resolve } from '$app/paths';
    import { Disc3Icon, EllipsisIcon, HeadphonesIcon, HeartIcon, HourglassIcon, ListMusicIcon, MicVocalIcon, PencilIcon, PlayIcon, Share2Icon } from '@lucide/svelte';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte.js';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import PlayerDropdownItems from '$lib/components/shared/app/player/PlayerDropdownItems.svelte';
    import { auth } from '$lib/client/auth.js';
    import ShareButton from '$lib/components/shared/app/release/ShareButton.svelte';
    import Card from '$lib/components/ui/card/card.svelte';
    import { CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import CardContent from '$lib/components/ui/card/card-content.svelte';
    import { parseLyrics } from '$lib/helpers/lyrics.js';
    import type { LyricLine } from '@applemusic-like-lyrics/core';
    import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '$lib/components/ui/empty';
    import { resource } from 'runed';
    import { formatDuration } from '../../../../../../lib/helpers/utils.js';

    let { data } = $props();

    const audioPlayer = AudioPlayer.context.get();
    const session = auth.useSession();

    let track = $derived({ ...data.track, release: undefined, lyrics: undefined });
    let lyrics = $derived(data.track.lyrics);
    let release = $derived(data.track.release);
    let user = $derived(release.user);
    let userLink = $derived(resolve('/(app)/artist/[userResolvable]', { userResolvable: user.username ? `@${user.username}` : user.id }));

    let lyricsContent: LyricLine[] = $state([]);

    $effect(() => {
        const lines = lyrics ? parseLyrics(lyrics) : [];
        lyricsContent = Array.isArray(lines) ? lines : [];
    });

    let coverURL = $derived(
        data.track.cover || data.track.release.cover
            ? Image.getPreviewPath({
                fileId: data.track.cover || data.track.release.cover!,
                width: 800,
                height: 800,
                gravity: ImageGravity.Center,
                output: ImageFormat.Webp
            })
            : coverPlaceholder
    );

    const streams = resource(
        () => data.track.id,
        async (trackId) => {
            const streams = await fetch(resolve('/(app)/api/track/[trackId]/streams', { trackId }));

            if (!streams.ok) {
                throw new Error('Failed to fetch stream count');
            }

            const { count } = await streams.json() as { count: number };
            return count;
        }
    );

    const likes = resource(
        () => data.track.id,
        async (trackId) => 4884
    );
</script>

<div class="flex flex-col md:flex-row">
    <section class="w-full shrink-0 flex flex-col items-center md:max-w-sm pb-5">
        <div class="p-5 w-full max-w-sm relative">
            <AspectRatio class="w-full rounded-md bg-muted cursor-pointer">
                <img src={coverURL} alt={data.track.name} class="size-full object-cover rounded-md"/>
                <img src={coverURL} alt={data.track.name} class="size-full object-cover absolute -z-10 top-0 left-0 opacity-50 saturate-150 blur-2xl"/>
            </AspectRatio>
        </div>
        <header class="w-full max-w-sm text-center px-5">
            <h1
                class="text-2xl leading-tight font-semibold line-clamp-3"
                style="word-wrap: break-word;"
            >
                {data.track.name}
                {#if data.track.explicit}
                    <ExplicitIcon/>
                {/if}
            </h1>
            <p class="text-sm leading-tight text-muted-foreground">
                {release.user.name}
            </p>
            <div class="flex gap-2 justify-center mt-5 max-w-sm px-20">
                <Button
                    variant="outline"
                    size="icon"
                >
                    <HeartIcon/>
                </Button>
                <Button
                    class="w-full"
                    onclick={async () => {
                        await audioPlayer.replaceCurrentTrack(track);
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
                        <PlayerDropdownItems tracks={[track]}/>
                        {#if $session.data?.user.id === release.userId}
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem>
                                {#snippet child({ props })}
                                    <a {...props} href={resolve('/(app)/release/[releaseId]/edit/track/[trackId]', { releaseId: release.id, trackId: track.id })}>
                                        <PencilIcon/>
                                        Edit Info
                                    </a>
                                {/snippet}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                {#snippet child({ props })}
                                    <a {...props} href={resolve('/(app)/release/[releaseId]/edit/track/[trackId]/lyrics', { releaseId: release.id, trackId: track.id })}>
                                        <MicVocalIcon/>
                                        Edit Lyrics
                                    </a>
                                {/snippet}
                            </DropdownMenuItem>
                        {/if}
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem>
                            {#snippet child({ props })}
                                <a
                                    {...props}
                                    href={resolve('/(app)/release/[releaseId]', { releaseId: release.id })}
                                >
                                    <ListMusicIcon/>
                                    View Release
                                </a>
                            {/snippet}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            {#snippet child({ props })}
                                <a
                                    {...props}
                                    href={userLink}
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
                                        title: release.name,
                                        text: `${release.name} by ${user.name} on Groovy`,
                                        url: new URL(resolve('/(app)/release/[releaseId]/track/[trackId]', { releaseId: release.id, trackId: track.id }), location.origin).href
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
    <section class="py-5 px-2.5 w-full pt-5 flex flex-col gap-2">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center gap-1">
                        <HeadphonesIcon class="text-blue-500 size-5 -mt-1"/>
                        <span>Total Streams</span>
                    </CardTitle>
                    <CardDescription>
                        {streams.current?.toLocaleString() ?? 'loading'} stream{streams.current === 1 ? '' : 's'}
                    </CardDescription>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center gap-1">
                        <HeartIcon class="text-primary size-5 -mt-1"/>
                        <span>Total Likes</span>
                    </CardTitle>
                    <CardDescription>
                        {likes.current?.toLocaleString() ?? 'loading'} like{likes.current === 1 ? '' : 's'}
                    </CardDescription>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center gap-1">
                        <HourglassIcon class="text-orange-500 size-5 -mt-1"/>
                        <span>Duration</span>
                    </CardTitle>
                    <CardDescription>
                        {#if track.duration}
                            {formatDuration(track.duration)}
                        {:else}
                            Not available
                        {/if}
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle class="flex items-center gap-1">
                    <MicVocalIcon class="text-mauve-500 size-5 -mt-1"/>
                    <span>Lyrics</span>
                </CardTitle>
            </CardHeader>
            <CardContent class="leading-loose text-sm">
                {#if lyrics}
                    {#each lyricsContent as line, i (i)}
                        <p>{line.words.map(w => w.word).join('')}</p>
                    {/each}
                {:else}
                    <Empty class="m-5 py-10 gap-0">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <MicVocalIcon/>
                            </EmptyMedia>
                        </EmptyHeader>
                        <EmptyTitle>
                            No lyrics available
                        </EmptyTitle>
                        <EmptyDescription>
                            This release has no lyrics added yet
                        </EmptyDescription>
                    </Empty>
                {/if}
            </CardContent>
        </Card>
    </section>
</div>
