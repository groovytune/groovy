<script lang="ts">
    import { ActiveNavigationPageContext } from '$lib/contexts/navigation';
    import { onDestroy, onMount } from 'svelte';

    let { children } = $props();

    const activeNavigationPage = ActiveNavigationPageContext.get();

    onMount(() => {
        activeNavigationPage.id = 'home';
    })

    onDestroy(() => {
        activeNavigationPage.id = '';
    });
</script>

{@render children?.()}
