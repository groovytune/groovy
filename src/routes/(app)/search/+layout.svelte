<script lang="ts">
    import { ActiveNavigationPageContext } from '$lib/contexts/navigation';

    let { children } = $props();

    const activeNavigationPage = ActiveNavigationPageContext.get();

    activeNavigationPage.id = 'search';
</script>

{@render children?.()}
