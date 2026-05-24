<script lang="ts">
    import ExplicitIcon from '../../icons/ExplicitIcon.svelte';

    let {
        name,
        description,
        explicit,
        coverURL,
        href
    }: {
        name: string;
        description?: string;
        explicit: boolean;
        coverURL?: string;
        href: string;
    } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
<a {href} class="flex flex-col shrink-0" style="content-visibility: auto;">
    <img src={coverURL} alt={name} class="aspect-square w-full bg-muted rounded-md object-cover"/>
    <div class="absolute bottom-0 z-10 p-5 w-full flex flex-col">
        <p class="text-white/80 text-sm leading-tight">
            {description}
        </p>
        <h3 class="font-semibold text-lg">
            {name}
            {#if explicit}
                <ExplicitIcon class="inline-block size-5"/>
            {/if}
        </h3>
    </div>
    <div class="absolute bottom-0 left-0 right-0 h-full bg-linear-to-t from-black/40 to-transparent z-0"></div>
</a>
