<script lang="ts">
    import { ActiveNavigationPageContext } from '$lib/contexts/navigation';

    let { children } = $props();

    const activeNavigationPage = ActiveNavigationPageContext.get();

    activeNavigationPage.id = 'discover';
</script>

{@render children?.()}
