<script lang="ts">
	import { deepMerge, MetaTags } from 'svelte-meta-tags';
	import { Toaster } from '../lib/components/ui/sonner';
	import '@fontsource-variable/google-sans-flex';
	import '@fontsource-variable/google-sans-code';
	import '@fontsource-variable/playfair-display';
	import { ModeWatcher } from 'mode-watcher';
	import { page } from '$app/state';
	import '$lib/styles/layout.css';

	let { children, data } = $props();
</script>

<Toaster/>
<ModeWatcher/>
<MetaTags {...deepMerge(data.baseMetaTags, page.data.pageMetaTags)}/>

{@render children()}
