<script lang="ts">
    import { Item, ItemContent, ItemDescription, ItemTitle } from '$lib/components/ui/item';

</script>

<Item
    class="p-2 hover:bg-secondary/50 rounded-md"
    style="content-visibility: auto;"
>
    <ItemContent>
        <ItemTitle>
            Track not found
        </ItemTitle>
        <ItemDescription>
            This track is no longer available.
        </ItemDescription>
    </ItemContent>
</Item>
