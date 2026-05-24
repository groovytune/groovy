<script lang="ts">
    import coverPlaceholder from '$lib/assets/cover.webp';
    import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../../../ui/item';
    import ExplicitIcon from '../../icons/ExplicitIcon.svelte';

    let {
        title,
        description,
        coverURL = coverPlaceholder,
        explicit = false,
        href
    }: {
        title: string;
        description?: string;
        coverURL?: string;
        explicit?: boolean;
        href?: string;
    } = $props();
</script>

<Item variant="outline" class="p-1 relative overflow-hidden z-10">
    {#snippet child({ props })}
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a href={href} {...props}>
            <img src={coverURL} alt={title} class="aspect-square h-full absolute top-0 left-0 -z-10 blur-lg opacity-20"/>
            <ItemMedia variant="image" class="size-16">
                <img src={coverURL} alt={title} class="aspect-square object-cover rounded"/>
            </ItemMedia>
            <ItemContent class="gap-0">
                <ItemTitle class="text-sm block">
                    {title}
                    {#if explicit}
                        <ExplicitIcon class="size-4"/>
                    {/if}
                </ItemTitle>
                <ItemDescription class="text-xs text-muted-foreground">
                    {description}
                </ItemDescription>
            </ItemContent>
        </a>
    {/snippet}
</Item>
