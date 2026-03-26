<script lang="ts">
    import { ActiveNavigationPage } from '$lib/contexts/navigation';

    let { children } = $props();

    const activeNavigationPage = ActiveNavigationPage.get();

    activeNavigationPage.id = 'home';
</script>

{@render children?.()}
