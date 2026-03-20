<script lang="ts">
    import NavHeader from '$lib/components/shared/app/NavHeader.svelte';


    let { children } = $props();
</script>

<NavHeader/>

<main class="size-full pt-16">{@render children?.()}
    <div class="size-full bg-accent"></div>
    <div class="block sm:hidden h-20"></div>
</main>
