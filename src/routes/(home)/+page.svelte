<script lang="ts">
    import { resolve } from '$app/paths';
    import { BoomBoxIcon, CompassIcon, MoonIcon, SunIcon, UserRoundPlusIcon } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { mode, toggleMode } from 'mode-watcher';
    import { Badge } from '$lib/components/ui/badge';
    import { auth } from '$lib/client/auth.js';
    import AvatarDropdown from '$lib/components/shared/AvatarDropdown.svelte';
    import { onMount } from 'svelte';
    import { cn } from '$lib/helpers/utils';
    import AudioPlayerPreview from '$lib/components/shared/home/AudioPlayerPreview.svelte';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte.js';
    import PopularReleases from '$lib/components/shared/home/PopularReleases.svelte';
    import bannerImage from '$lib/assets/banner.jpg';

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
            <a href={resolve('/(app)/home')}>Community</a>
            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
            <a href={resolve('/(home)') + '#about'}>About Us</a>
            <a href={resolve('/(app)/artists')}>Artists</a>
            <a href={resolve('/(app)/discover/chart')}>Popular</a>
        </nav>
        <div class="flex gap-2 items-center">
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

<main class="flex flex-col items-center py-16 px-4 size-ful">
    <section class="container min-h-[600px] h-full flex flex-col gap-10 justify-center items-center text-center relative">
        <span class="h-1/2 w-full max-w-sm bg-primary/20 dark:bg-primary/10 absolute top-0 left-1/2 -translate-x-1/2 -z-10 rounded-full blur-3xl"></span>
        <div class="text-center">
            <Badge variant="outline" class="text-xs border-primary/50 bg-background/10 dark:bg-primary/10 text-primary font-semibold tracking-wide uppercase p-1 px-2.5">
                <span class="inline-block size-1.5 ring-3 ring-primary/30 rounded-full bg-primary mr-1"></span>
                <span>Free Music Sharing Platform</span>
            </Badge>
        </div>
        <h1 class="text-center text-5xl sm:text-6xl md:text-7xl font-bold font-serif">
            <span>Music that</span>
            <br>
            <em class="text-primary italic">moves your soul.</em>
        </h1>
        <p class="text-muted-foreground max-w-sm text-sm">
            Publish, discover, and share music freely. Build your artist profile and reach listeners
        </p>
        <div class="flex  justify-center gap-2 w-full max-w-2xs">
            <Button href={resolve('/(app)/release/new')} size="lg" class="w-fit">
                {#if !$session.data?.user}
                    Get Started
                {:else}
                    New Release
                {/if}
            </Button>
            <Button href={resolve('/(app)/discover')} variant="outline" size="lg" class="w-fit">
                View Charts
            </Button>
        </div>
        <div class="w-full flex flex-col items-center gap-5 text-start " class:invisible={!audioPlayer.currentTrack}>
            <AudioPlayerPreview class="shadow"/>
        </div>
    </section>
    <section
        id="about"
        class={cn(
            "container w-full flex flex-col-reverse sm:grid md:grid-cols-2 sm:min-h-[500px] rounded-4xl overflow-hidden border-2",
            "bg-linear-to-r from-[#d53369]/20 to-[#daae51]/20 border-[#d53369]/30"
        )}
    >
        <div class="flex flex-col gap-10 w-full justify-center p-10">
            <h2 class="text-4xl font-bold sm:flex hidden items-center gap-2 text-center justify-center sm:justify-start">
                <BoomBoxIcon class="size-9"/>
                Groovy
            </h2>
            <p class="text-foreground/90 sm:text-lg text-justify">
                Groovy is a free music sharing platform that empowers artists to publish their music and connect with their listeners in one unified platform. Discover new music, build your profile, and share your passion with the world. Join our community of music lovers and artists today!
            </p>
            <div>
                <Button
                    size="lg"
                    variant="default"
                    class="w-full sm:w-auto shadow-primary shadow-lg"
                    href={resolve('/(auth)/signin')}
                >
                    Get Started
                </Button>
            </div>
        </div>
        <div class="w-full h-full p-0 sm:p-5 md:block sm:hidden">
            <img src={bannerImage} alt="Groovy" class="size-full object-cover rounded-t-2xl sm:rounded-2xl"/>
        </div>
    </section>
    <section class="container w-full flex flex-col gap-10 sm:gap-6 mt-10">
        <h1 class="text-2xl sm:text-4xl font-bold sm:px-5 text-center sm:text-start relative">
            <CompassIcon class="text-primary size-6 sm:size-8 hidden sm:inline -mt-2"/>
            Popular Releases
            <span class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-primary rounded-full sm:hidden"></span>
        </h1>
        <PopularReleases/>
    </section>
</main>
