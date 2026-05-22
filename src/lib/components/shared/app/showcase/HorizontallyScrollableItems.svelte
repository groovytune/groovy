<script lang="ts" generics="Item extends { id: string; }">
    import type { IconProps } from '@lucide/svelte';
    import type { Component, Snippet } from 'svelte';
    import { ScrollArea } from '$lib/components/ui/scroll-area';
    import ExplicitIcon from '../../icons/ExplicitIcon.svelte';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import type { ClassValue } from 'clsx';
    import { cn } from '$lib/helpers/utils';

    let {
        title,
        icon,
        loading = false,
        items = [],
        child,
        skeletonItem,
        class: className
    }: {
        title: string;
        icon?: Component<IconProps>;
        loading?: boolean;
        items: Item[];
        child?: Snippet<[{ item: Item; index: number; }]>;
        skeletonItem?: Snippet;
        class?: ClassValue;
    } = $props();
</script>

<script lang="ts" module>
    export { ScrollableItem };
</script>

{#snippet ScrollableItem(name: string, description: string, coverURL: string, explicit: boolean, href: string, descriptionHref?: string)}
    <div class="flex flex-col shrink-0 w-40 sm:w-80" title={name} style="content-visibility: auto;">
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a href={href}>
            <img src={coverURL} alt="Album Cover" class="size-40 sm:size-80 rounded-md object-cover"/>
        </a>
        <div>
            <h2 class="sm:text-lg text-sm font-semibold mt-2 line-clamp-2 truncate text-balance">
                <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                <a href={href}>
                    {name}
                    {#if explicit}
                        <ExplicitIcon class="size-4 sm:size-5"/>
                    {/if}
                </a>
            </h2>
            <p class="text-xs sm:text-sm text-muted-foreground line-clamp-2 truncate text-balance">
                <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                <a href={descriptionHref ?? href}>
                    {description}
                </a>
            </p>
        </div>
    </div>
{/snippet}

{#snippet ItemSkeletons(length: number = 5)}
    {#each { length }}
        <div class="flex flex-col shrink-0" style="content-visibility: auto;">
            <Skeleton class="size-40 sm:size-80"/>
            <div class="mt-2 space-y-2">
                <Skeleton class="w-20 sm:w-48 h-4"/>
                <Skeleton class="w-14 sm:w-40 h-3"/>
            </div>
        </div>
    {/each}
{/snippet}

<section class={cn('w-full', className)}>
    <h1 class="text-2xl sm:text-4xl font-bold my-4 flex items-center gap-2 px-5">
        {#if icon}
            {@const Icon = icon}
            <Icon class="text-primary size-7 sm:size-8"/>
        {/if}
        {title}
    </h1>
    <div class="pb-5">
        <ScrollArea orientation="horizontal">
            <div class="flex gap-4 px-5 pb-4">
                {#if loading}
                    {#if skeletonItem}
                        {@render skeletonItem?.()}
                    {:else}
                        {@render ItemSkeletons()}
                    {/if}
                {:else if items.length}
                    {#each items as item, index (item.id)}
                        {@render child?.({
                            item,
                            index
                        })}
                    {/each}
                {/if}
            </div>
        </ScrollArea>
    </div>
</section>
