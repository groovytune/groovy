<script lang="ts">
    import { resolve } from '$app/paths';
    import { BoomBoxIcon, MoonIcon, SunIcon, UserRoundPlusIcon } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { mode, toggleMode } from 'mode-watcher';
    import { Badge } from '$lib/components/ui/badge';
    import { auth } from '$lib/client/auth.js';
    import AvatarDropdown from '$lib/components/shared/AvatarDropdown.svelte';
    import { onMount } from 'svelte';
    import { cn } from '$lib/helpers/utils';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio';
    import { ImageFormat, ImageGravity } from 'appwrite';
    import placeholderCover from '$lib/assets/cover.webp';
    import AudioPlayerPreview from '$lib/components/shared/home/AudioPlayerPreview.svelte';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte.js';
    import { Image } from '$lib/client/image.js';

    let { data } = $props();

    const session = auth.useSession();
    const audioPlayer = AudioPlayer.context.get();

    let scrolled = $state(false);

    function onScroll() {
        scrolled = window.scrollY > 10;
    }

    onMount(() => {
        onScroll();
    });
</script>

<svelte:window onscroll={onScroll}/>

<header
    class={cn(
        "sm:fixed top-0 left-0 right-0 z-50 w-full h-16 flex justify-center transition-colors duration-300",
        scrolled && "bg-background/80 border-b border-muted/50 backdrop-blur-sm"
    )}
>
    <div class="container h-full flex items-center justify-between gap-6 px-5">
        <a href={resolve('/')} class="shrink-0 flex items-center gap-1 self-center font-bold font-fugaz sm:text-lg text-xl text-primary">
			<BoomBoxIcon class="sm:size-6 size-7"/>
			<span class="mt-1">Groovy</span>
		</a>
        <nav class="gap-5 hidden md:flex text-sm font-medium text-muted-foreground">
            <a href="#/">Features</a>
            <a href="#/">How it works</a>
            <a href="#/">Artists</a>
            <a href="#/">Community</a>
        </nav>
        <div class="flex gap-2">
            <Button size="icon" variant="outline" onclick={toggleMode}>
                {#if mode.current == 'light'}
                    <MoonIcon/>
                {:else}
                    <SunIcon/>
                {/if}
            </Button>
            {#if !$session.data?.user}
                <Button href={resolve('/(auth)/signin')}>
                    <UserRoundPlusIcon/>
                    Sign Up
                </Button>
            {:else}
                <AvatarDropdown user={$session.data.user}/>
            {/if}
        </div>
    </div>
</header>

<main class="flex justify-center items-center py-16 px-2 min-h-[600px] h-screen">
    <section class="container h-full flex flex-col gap-10 justify-center items-center text-center relative">
        <span class="h-1/2 w-full max-w-sm bg-primary/20 dark:bg-primary/10 absolute top-0 left-1/2 -translate-x-1/2 -z-10 rounded-full blur-3xl"></span>
        <div class="text-center">
            <Badge variant="outline" class="text-xs border-primary/50 bg-background/10 dark:bg-primary/10 text-primary font-semibold tracking-wide uppercase p-1 px-2.5">
                <span class="inline-block size-1.5 ring-3 ring-primary/30 rounded-full bg-primary mr-1"></span>
                <span>Free Music Sharing Platform</span>
            </Badge>
        </div>
        <h1 class="text-center text-7xl font-bold font-serif">
            <span>Music that</span>
            <br>
            <em class="text-primary italic">moves your soul.</em>
        </h1>
        <p class="text-muted-foreground max-w-sm">
            Publish, discover, and share music freely. Build your artist profile and reach listeners
        </p>
        <div class="flex justify-center gap-2">
            <Button href={resolve('/(app)/release/new')} size="lg">
                Start sharing music
            </Button>
            <Button href={resolve('/(app)/discover')} variant="outline" size="lg">
                Explore top songs
            </Button>
        </div>
        <div class="w-full flex flex-col items-center gap-5 text-start " class:invisible={!audioPlayer.currentTrack}>
            <AudioPlayerPreview class="shadow"/>
        </div>
    </section>
</main>
<div class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-5">
    {#each data.releases as release (release.id)}
        {@const coverURL = release.cover
            ? Image.getPreviewPath({
                fileId: release.cover,
                height: 500,
                width: 500,
                gravity: ImageGravity.Center,
                output: ImageFormat.Webp
            })
            : placeholderCover
        }
        <a href={resolve('/(app)/release/[releaseId]', { releaseId: release.id })} class="p-5 w-full max-w-sm relative">
            <AspectRatio class="w-full rounded-md bg-muted cursor-pointer transition-blur duration-300">
                <img src={coverURL} alt={release.name} class="size-full object-cover rounded-md"/>
                <img src={coverURL} alt={release.name} class="size-full object-cover absolute -z-10 top-0 left-0 opacity-50 saturate-150 blur-2xl"/>
            </AspectRatio>
            <header class="w-full max-w-sm text-center px-5">
                <h1
                    class="text-2xl leading-tight font-semibold line-clamp-3"
                    style="word-wrap: break-word;"
                >
                    {release.name}
                </h1>
                <p class="text-sm leading-tight text-muted-foreground">
                    {release.user.name}
                </p>
                <p
                    class="text-xs leading-tight text-muted-foreground/60 line-clamp-2 hover:line-clamp-none mt-2"
                    style="word-wrap: break-word;"
                    title={release.description}
                >
                    {release.description}
                </p>
            </header>
        </a>
    {/each}
</div>
