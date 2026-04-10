<script lang="ts">
    import NavHeader from '$lib/components/shared/app/NavHeader.svelte';


    let { children } = $props();
</script>

<NavHeader/>

<main class="size-full sm:pt-16 flex justify-center">
    <div class="container">
        {@render children?.()}
        <div class="block sm:hidden h-16"></div>
    </div>
</main>
