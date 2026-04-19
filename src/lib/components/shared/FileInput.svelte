<script lang="ts">
    import type { HTMLInputAttributes } from 'svelte/elements';
    import { cn, type WithElementRef } from '../../helpers/utils';
    import type { Snippet } from 'svelte';
    import Button from '../ui/button/button.svelte';
    import { FileIcon, FilesIcon, UploadIcon } from '@lucide/svelte';

	type Props = WithElementRef<Omit<HTMLInputAttributes, "type"> & { files?: FileList }> & { children?: Snippet<[data: { ref: HTMLElement|null; props: { onclick: () => void; } }]>; };

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
    <Button variant="outline" class={cn("w-full justify-start rounded-md overflow-clip", className)} onclick={() => ref?.click()}>
        {#if files && files.length > 0}
            {#if files.length > 1}
                <FilesIcon/>
            {:else}
                <FileIcon/>
            {/if}
            <span class="truncate">{files.length > 1 ? `${files.length} files selected` : files[0].name}</span>
        {:else}
            <UploadIcon/>
            <span class="truncate">Select a file{restProps.multiple ? 's' : ''}</span>
        {/if}
    </Button>
{/if}
