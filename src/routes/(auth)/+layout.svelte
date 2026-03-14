<script lang="ts">
    import { resolve } from '$app/paths';
    import { BoomBoxIcon } from '@lucide/svelte';

    let { children } = $props();
</script>

<div class="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
	<div class="flex w-full max-w-sm flex-col gap-6">
		<a href={resolve('/')} class="flex items-center gap-1 self-center font-bold font-fugaz text-lg text-primary">
			<BoomBoxIcon class="size-6 mb-1"/>
			<span>Groovy</span>
		</a>
		<div class="flex flex-col gap-6">
            {@render children?.()}
        </div>
	</div>
</div>
