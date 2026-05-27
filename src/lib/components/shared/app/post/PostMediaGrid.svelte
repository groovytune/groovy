<script lang="ts">
    import { XIcon } from '@lucide/svelte';
    import { Badge } from '$lib/components/ui/badge';
    import { Button } from '$lib/components/ui/button';
    import type { ClassValue } from 'clsx';
    import { cn } from '$lib/helpers/utils';
    import type { Snippet } from 'svelte';

    let {
        media,
        preview,
        disabled = false,
        class: className = '',
        onremove,
        child
    }: {
        media: { type: 'image'|'video'; mime?: string; url: string; }[];
        preview?: boolean;
        disabled?: boolean;
        class?: ClassValue;
        onremove?: (index: number) => void;
        child?: Snippet<[{
            item: { type: 'image'|'video'; mime?: string; url: string; };
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
                        class="rounded-md bg-black size-full object-cover"
                        class:aspect-square={media.length > 1 || preview}
                        alt="Post Media"
                    />
                {:else if item.type == 'video'}
                    <video
                        class="rounded-md bg-black"
                        class:aspect-square={media.length > 1}
                        class:aspect-video={media.length === 1}
                        controls={!preview}
                        controlslist="nodownload,noplaybackrate"
                        oncontextmenu={e => e.preventDefault()}
                    >
                        <source src={item.url} type={item.mime}/>
                        Your browser does not support the video tag.
                    </video>
                {/if}
            </a>
        {/if}
    {/each}
</div>
