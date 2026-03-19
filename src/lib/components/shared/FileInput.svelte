<script lang="ts">
    import type { HTMLInputAttributes } from 'svelte/elements';
    import type { WithElementRef } from '../../helpers/utils';
    import type { Snippet } from 'svelte';
    import Button from '../ui/button/button.svelte';

	type Props = WithElementRef<
        Omit<HTMLInputAttributes, "type"> & { files?: FileList }
    > & {
        children?: Snippet<[data: { ref: HTMLElement|null; props: { onclick: () => void; } }]>;
    };

	let {
	    ref = $bindable(null),
	    files = $bindable(),
	    class: className,
	    "data-slot": dataSlot = "input",
        children,
	    ...restProps
	}: Props = $props();
</script>

<input
    type="file"
    bind:this={ref}
    bind:files
    data-slot={dataSlot}
    {...restProps}
    hidden
/>

{#if ref && children}
    {@render children({ ref, props: { onclick: () => ref?.click() } })}
{:else}
    <Button variant="outline" class={className} onclick={() => ref?.click()}>
        {files && files.length > 0
            ? files.length === 1
                ? files[0].name
                : `${files.length} files selected`
            : "Select a file"
        }
    </Button>
{/if}
