<script lang="ts">
    import NavHeader from '$lib/components/shared/app/NavHeader.svelte';
    import MiniPlayerScrollPadding from '$lib/components/shared/app/player/MiniPlayerScrollPadding.svelte';
    import MiniPlayer from '$lib/components/shared/app/player/MiniPlayer.svelte';

    let { children } = $props();
</script>

<NavHeader/>
<MiniPlayer/>

<main class="size-full sm:pt-16 flex justify-center">
    <div class="container">
        {@render children?.()}
        <MiniPlayerScrollPadding/>
        <div class="block sm:hidden h-16"></div>
    </div>
</main>
