<script lang="ts">
    import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '$lib/components/ui/item';
    import coverPlaceholder from '$lib/assets/cover.webp';

    let {
        cover = false
    }: {
        cover?: boolean;
    } = $props();
</script>

<Item
    class="p-2 rounded-md cursor-default w-full"
    style="content-visibility: auto;"
>
    {#if cover}
        <ItemMedia variant="image" class="-mt-0.5">
            <img
                alt="Track Cover"
                src={coverPlaceholder}
                class="rounded-md"
            />
        </ItemMedia>
    {/if}
    <ItemContent class="gap-0">
        <ItemTitle>
            Track not found
        </ItemTitle>
        <ItemDescription>
            This track is no longer available.
        </ItemDescription>
    </ItemContent>
</Item>
