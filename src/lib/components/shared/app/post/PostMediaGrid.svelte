<script lang="ts">
    import { XIcon } from '@lucide/svelte';
    import { Badge } from '../../../ui/badge';
    import { Button } from '../../../ui/button';
    import type { ClassValue } from 'clsx';
    import { cn } from '../../../../helpers/utils';
    import type { Snippet } from 'svelte';

    let {
        media,
        preview,
        disabled = false,
        class: className = '',
        onremove,
        child
    }: {
        media: { type: 'image'|'video'; url: string; }[];
        preview?: boolean;
        disabled?: boolean;
        class?: ClassValue;
        onremove?: (index: number) => void;
        child?: Snippet<[{
            item: { type: 'image'|'video'; url: string; };
            index: number;
        }]>;
    } = $props();
</script>

<div class={cn("grid grid-cols-2 gap-2", className)} class:pointer-events-none={preview}>
    {#each media as item, index (item.url)}
        {#if child}
            {@render child({ item, index })}
        {:else}
            <a href="#/" class="relative last:odd:col-span-2">
                {#if preview && !disabled}
                    <Button variant="secondary" size="icon-sm" class="absolute top-1 right-1 pointer-events-auto" onclick={() => onremove?.(index)}>
                        <XIcon/>
                    </Button>
                {/if}
                {#if preview}
                    <Badge variant="outline" class="absolute bottom-1 right-1 bg-secondary text-secondary-foreground capitalize">{item.type}</Badge>
                {/if}
                {#if item.type == 'image'}
                    <img
                        src={item.url}
                        class="rounded-md object-cover"
                        class:aspect-square={media.length > 1}
                        alt="Post Media"
                    />
                {:else if item.type == 'video'}
                    <!-- svelte-ignore a11y_media_has_caption -->
                    <video
                        src={item.url}
                        class="rounded-md object-cover"
                        class:aspect-square={media.length > 1}
                        controls={!preview}
                    >
                    </video>
                {/if}
            </a>
        {/if}
    {/each}
</div>
