<script lang="ts">
    import { cn } from '$lib/helpers/utils';


    let {
        length = 20,
        class: className,
        barClass: barClassName
    }: {
        length?: number;
        class?: string;
        barClass?: string;
    } = $props();

    let bars = $derived(
        Array
            .from({ length }, () => 0)
            .map(() => Math.round(Math.random() * 100))
    );
</script>

<style>
    .groovy-pulse {
        animation: groovy-pulse 1s ease-in-out infinite;
    }

    @keyframes groovy-pulse {
        0%,100% { transform: scaleY(1); }
        50% { transform: scaleY(0.4); }
    }
</style>

<div class={cn("flex items-center gap-1 h-20", className)}>
    {#each bars as bar, index (index)}
        {@const duration = 1.1 + Math.random() * 0.5}
        {@const delay = Math.random() * 0.2 + (duration / index)}
        {@const opacity = 0.3 + Math.random() * 1}
        <div
            class={cn("bg-primary rounded-sm w-1 min-h-4 groovy-pulse", barClassName)}
            style="height: {bar}%; animation-duration: {duration}s; animation-delay: {delay}s; opacity: {opacity}"
        ></div>
    {/each}
</div>
