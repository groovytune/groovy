<script lang="ts">
    import { resolve } from '$app/paths';
    import { BoomBoxIcon, MoonIcon, SunIcon, UserRoundPlusIcon } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button/index.js';
    import { mode, toggleMode } from 'mode-watcher';
    import { Badge } from '$lib/components/ui/badge';
    import { auth } from '$lib/client/auth.js';
    import AvatarDropdown from '$lib/components/shared/AvatarDropdown.svelte';
    import { onMount } from 'svelte';
    import { cn } from '../../lib/helpers/utils';

    const session = auth.useSession();

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
                <Button>
                    <UserRoundPlusIcon/>
                    Sign Up
                </Button>
            {:else}
                <AvatarDropdown user={$session.data.user}/>
            {/if}
        </div>
    </div>
</header>

<main class="flex justify-center size-full">
    <section class="container h-full flex flex-col gap-10 justify-center items-center text-center relative">
        <span class="h-1/2 w-full max-w-sm bg-primary/20 dark:bg-primary/10 absolute top-0 left-1/2 -translate-x-1/2 -z-10 rounded-full blur-3xl"></span>
        <div class="text-center">
            <Badge variant="outline" class="text-sm border-primary/50 bg-background/10 dark:bg-primary/10 text-primary font-semibold p-1.5 px-3">
                <span class="inline-block size-2 rounded-full bg-primary mr-1"></span>
                Free Music Sharing Platform
            </Badge>
        </div>
        <h1 class="text-center text-7xl font-bold">
            <span class="font-serif">Music that</span>
            <br>
            <span class="text-primary italic">moves your soul</span>
        </h1>
        <p class="text-muted-foreground max-w-sm">
            Publish, discover, and share music freely. Build your artist profile and reach listeners
        </p>
        <div class="flex justify-center gap-2">
            <Button>
                Start sharing music
            </Button>
            <Button variant="outline">
                Explore top songs
            </Button>
        </div>
    </section>
</main>
<div class="size-full"></div>
