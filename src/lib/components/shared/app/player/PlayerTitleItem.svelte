<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Disc3Icon, EllipsisIcon, HeartIcon, InfoIcon, ListMusicIcon, Music4Icon, Share2Icon } from '@lucide/svelte';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '$lib/components/ui/item';
    import ExplicitIcon from '$lib/components/shared/icons/ExplicitIcon.svelte';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import type { ClassValue } from 'clsx';
    import { cn, createUserProfileURL } from '$lib/helpers/utils';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import ShareButton from '../release/ShareButton.svelte';
    import { resolve } from '$app/paths';
    import LikeButton from '../LikeButton.svelte';
    import { page } from '$app/state';

    let {
        cover = false,
        addReleaseName = false,
        class: className,
        titleClassName,
        artistClassName,
        coverClassName,
        oncoverclick
    }: {
        cover?: boolean;
        addReleaseName?: boolean;
        class?: ClassValue;
        titleClassName?: ClassValue;
        artistClassName?: ClassValue;
        coverClassName?: ClassValue;
        oncoverclick?: () => void;
    } = $props();

    const audioPlayer = AudioPlayer.context.get();
</script>

<Item class={cn(className)}>
    {#if cover}
        <ItemMedia variant="image" class={cn("size-14", coverClassName)} onclick={oncoverclick}>
            <img
                src={audioPlayer.previewCoverURL}
                alt={audioPlayer.currentTrack?.name ?? "Cover Art"}
                class="now-cover"
            >
        </ItemMedia>
    {/if}
    <ItemContent class="gap-0">
        <ItemTitle class={cn("now-title text-lg sm:text-xl leading-tight font-semibold line-clamp-3", titleClassName)}>
            <!-- svelte-ignore a11y_distracting_elements -->
            <marquee behavior="alternate" direction="vertical" scrollamount="1">
                <a
                    data-sveltekit-preload-code="eager"
                    href={
                        audioPlayer.currentTrack
                            ? resolve(
                                '/(app)/release/[releaseId]/track/[trackId]',
                                {
                                    releaseId: audioPlayer.currentTrack.releaseId,
                                    trackId: audioPlayer.currentTrack.id
                                }
                            )
                            : '#/'
                    }
                >
                    {audioPlayer.currentTrack?.name || 'Unknown Track'}
                    {#if audioPlayer.currentTrack?.explicit}
                        <ExplicitIcon class="size-5"/>
                    {/if}
                </a>
            </marquee>
        </ItemTitle>
        <ItemDescription class={cn("now-artist text-sm font-medium leading-tight text-foreground/80", artistClassName)}>
            <!-- svelte-ignore a11y_distracting_elements -->
            <marquee behavior="alternate" direction="vertical" scrollamount="1" class="w-fit">
                <a
                    data-sveltekit-preload-code="eager"
                    href={
                        audioPlayer.artistInfo.current
                            ? createUserProfileURL(audioPlayer.artistInfo.current)
                            : '#/'
                    }
                >
                    {audioPlayer.artistInfo.current?.name || 'Unknown Artist'}{addReleaseName && audioPlayer.releaseInfo.current ? ` • ${audioPlayer.releaseInfo.current.name}` : ''}
                </a>
            </marquee>
        </ItemDescription>
    </ItemContent>
    {#if audioPlayer.currentTrack != null}
        <ItemActions>
            <LikeButton itemId={audioPlayer.currentTrack.id} itemType="track">
                {#snippet child({ liked, toggleLike, props })}
                    <Button
                        {...props}
                        onclick={toggleLike}
                        variant="secondary"
                        size="icon"
                        class={[
                            "bg-white/10! shadow-none",
                            liked && "bg-white/80! text-black!"
                        ]}
                    >
                        <HeartIcon class={[liked && "fill-current"]}/>
                    </Button>
                {/snippet}
            </LikeButton>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    {#snippet child({ props })}
                        <Button {...props} variant="secondary" size="icon" class="bg-white/10! shadow-none">
                            <EllipsisIcon/>
                        </Button>
                    {/snippet}
                </DropdownMenuTrigger>
                <DropdownMenuContent class="mx-2 min-w-40">
                    <DropdownMenuItem>
                        {#snippet child({ props })}
                            <a
                                {...props}
                                href={resolve(
                                    '/(app)/release/[releaseId]/track/[trackId]',
                                    { releaseId: audioPlayer.currentTrack!.releaseId, trackId: audioPlayer.currentTrack!.id }
                                )}
                            >
                                <Music4Icon/>
                                View Track
                            </a>
                        {/snippet}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        {#snippet child({ props })}
                            <a {...props} href={resolve('/(app)/release/[releaseId]', { releaseId: audioPlayer.currentTrack!.releaseId })}>
                                <ListMusicIcon/>
                                View Release
                            </a>
                        {/snippet}
                    </DropdownMenuItem>
                    {#if audioPlayer.artistInfo.current}
                        <DropdownMenuItem>
                            {#snippet child({ props })}
                                <a
                                    {...props}
                                    href={createUserProfileURL(audioPlayer.artistInfo.current!)}
                                >
                                    <Disc3Icon/>
                                    View Artist
                                </a>
                            {/snippet}
                        </DropdownMenuItem>
                    {/if}
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem>
                        {#snippet child({ props })}
                            <a {...props}>
                                <InfoIcon/>
                                Credits
                            </a>
                        {/snippet}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        {#snippet child({ props })}
                            <ShareButton
                                data={{
                                    title: audioPlayer.currentTrack?.name,
                                    url: new URL(resolve('/(app)/release/[releaseId]', { releaseId: audioPlayer.currentTrack!.releaseId }), page.url.origin).href
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
        </ItemActions>
    {/if}
</Item>
