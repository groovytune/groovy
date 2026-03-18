<script lang="ts">
	import { deepMerge, MetaTags } from 'svelte-meta-tags';
	import { Toaster } from '../lib/components/ui/sonner';
	import '@fontsource-variable/google-sans-flex';
	import '@fontsource-variable/google-sans-code';
	import '@fontsource-variable/playfair-display';
	import { mode, ModeWatcher, setTheme, theme, toggleMode } from 'mode-watcher';
	import { page } from '$app/state';
	import { Button } from '../lib/components/ui/button/index.js';
	import { MoonIcon, SunIcon } from '@lucide/svelte';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';

	let { children, data } = $props();
</script>

<Toaster/>
<ModeWatcher/>
<MetaTags {...deepMerge(data.baseMetaTags, page.data.pageMetaTags)}/>

<div class="flex">
    <Button onclick={() => toggleMode()}>
        {#if mode.current == 'light'}
            <MoonIcon/>
        {:else}
            <SunIcon/>
        {/if}
    </Button>
    <Select type="single" onValueChange={(value) => setTheme(value)}>
        <SelectTrigger>
            {theme.current || 'Select Theme'}
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="rose">Rose</SelectItem>
        </SelectContent>
    </Select>
</div>

{@render children()}
