<script lang="ts">
    import type { ClassValue } from 'clsx';
    import { cn } from '$lib/helpers/utils';

    let {
        lyrics,
        class: className = ''
    }: {
        lyrics: string;
        class?: ClassValue;
    } = $props();
</script>

<div class={cn("h-fit w-full flex flex-col pt-20 pb-[100svh] px-5", className)}>
    {#each lyrics.split('\n') as line, index (index)}
        <p class="block">
            {line}
        </p>
    {/each}
</div>
