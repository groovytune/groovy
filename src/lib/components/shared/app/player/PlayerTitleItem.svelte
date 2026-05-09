<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Disc3Icon, EllipsisIcon, HeartIcon, InfoIcon, ListMusicIcon, Share2Icon } from '@lucide/svelte';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '$lib/components/ui/item';
    import ExplicitIcon from '$lib/components/shared/icons/ExplicitIcon.svelte';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import type { ClassValue } from 'clsx';
    import { cn } from '$lib/helpers/utils';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';

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
            <img src={audioPlayer.previewCoverURL} alt="" class="now-cover">
        </ItemMedia>
    {/if}
    <ItemContent class="gap-0">
        <ItemTitle class={cn("now-title text-lg sm:text-xl leading-tight font-semibold line-clamp-3", titleClassName)}>
            <!-- svelte-ignore a11y_distracting_elements -->
            <marquee behavior="alternate" direction="vertical" scrollamount="1">
                {audioPlayer.currentTrack?.name || 'Unknown Track'}
                {#if audioPlayer.currentTrack?.explicit}
                    <ExplicitIcon class="size-5"/>
                {/if}
            </marquee>
        </ItemTitle>
        <ItemDescription class={cn("now-artist text-sm font-medium leading-tight text-foreground/80", artistClassName)}>
            <!-- svelte-ignore a11y_distracting_elements -->
            <marquee behavior="alternate" direction="vertical" scrollamount="1" class="w-fit">
                {audioPlayer.artistInfo.current?.name || 'Unknown Artist'}{addReleaseName && audioPlayer.releaseInfo.current ? ` • ${audioPlayer.releaseInfo.current.name}` : ''}
            </marquee>
        </ItemDescription>
    </ItemContent>
    <ItemActions>
        <Button variant="secondary" size="icon" class="bg-white/10! shadow-none">
            <HeartIcon/>
        </Button>
        <DropdownMenu>
            <DropdownMenuTrigger>
                {#snippet child({ props })}
                    <Button {...props} variant="secondary" size="icon" class="bg-white/10! shadow-none">
                        <EllipsisIcon/>
                    </Button>
                {/snippet}
            </DropdownMenuTrigger>
            <DropdownMenuContent class="mx-2 min-w-40">
                <!-- TODO: Implement these functionalities -->
                <DropdownMenuItem>
                    {#snippet child({ props })}
                        <a {...props}>
                            <ListMusicIcon/>
                            View Release
                        </a>
                    {/snippet}
                </DropdownMenuItem>
                <DropdownMenuItem>
                    {#snippet child({ props })}
                        <a {...props}>
                            <Disc3Icon/>
                            View Artist
                        </a>
                    {/snippet}
                </DropdownMenuItem>
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
                        <a {...props}>
                            <Share2Icon/>
                            Share
                        </a>
                    {/snippet}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </ItemActions>
</Item>
