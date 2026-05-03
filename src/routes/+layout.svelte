<script lang="ts">
	import { deepMerge, MetaTags } from 'svelte-meta-tags';
	import { Toaster } from '$lib/components/ui/sonner';
	import '@fontsource-variable/google-sans-flex';
	import '@fontsource-variable/google-sans-code';
	import '@fontsource-variable/playfair-display';
	import '@fontsource-variable/google-sans-flex/wght.css';
	import '@fontsource-variable/google-sans-code/wght.css';
	import '@fontsource-variable/playfair-display/wght.css';
	import '@fontsource-variable/playfair-display/wght-italic.css';
	import { ModeWatcher } from 'mode-watcher';
	import { page } from '$app/state';
	import '$lib/styles/app.css';
	import { ActiveNavigationPageContext } from '$lib/contexts/navigation.js';
	import { TooltipProvider } from '$lib/components/ui/tooltip/index.js';
	import { AudioPlayerContext } from '$lib/contexts/player.js';
	import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte.js';
	import { onDestroy, onMount } from 'svelte';
	import PlayerMediaSession from '$lib/components/shared/app/player/PlayerMediaSession.svelte';
	import { onNavigate } from '$app/navigation';

	let { children, data } = $props();
    let activeNavigationPage = $state({ id: '' });

    const audioPlayer = new AudioPlayer();

    ActiveNavigationPageContext.set(activeNavigationPage);
    AudioPlayerContext.set(audioPlayer);

    onMount(() => {
        audioPlayer.init();
    });

    onDestroy(() => {
        audioPlayer.destroy();
    });


    onNavigate(navigation => {
        if (!document.startViewTransition) return;

        return new Promise(resolve => document
            .startViewTransition(async () => {
                resolve();
                await navigation.complete;
            })
        );
    });
</script>

<Toaster/>
<ModeWatcher/>
<PlayerMediaSession/>
<MetaTags {...deepMerge(data.baseMetaTags, page.data.pageMetaTags)}/>

<TooltipProvider>
    {@render children()}
</TooltipProvider>
