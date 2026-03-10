<script lang="ts">
	import '$lib/styles/layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '../lib/components/ui/sonner';
	import { deepMerge, MetaTags } from 'svelte-meta-tags';
	import { page } from '$app/state';

	let { children, data } = $props();
</script>

<Toaster/>
<ModeWatcher/>
<MetaTags {...deepMerge(data.baseMetaTags, page.data.pageMetaTags)}/>

{@render children()}
