<script lang="ts">
    import type { LyricLine } from '@applemusic-like-lyrics/core';
    import { ScrollArea } from '../../../ui/scroll-area';
    import type { ClassValue } from 'clsx';
    import { cn } from '../../../../helpers/utils';
    import { useDebounce, useEventListener } from 'runed';

    let {
        currentTime,
        lyrics,
        setCurrentTime,
        ref = $bindable(null),
        class: className,
        hidePassedLines = true,
        scrollBlock: scrollAlign = 'center',
        scrollBehavior = 'smooth'
    }: {
        currentTime: number;
        lyrics: LyricLine[]|string;
        setCurrentTime?: (time: number) => void;
        ref?: HTMLElement|null;
        class?: ClassValue;
        hidePassedLines?: boolean;
        scrollBlock?: 'start'|'center'|'end'|'nearest';
        scrollBehavior?: ScrollBehavior;
    } = $props();

    let container: HTMLElement|null = $state(null);
    let isUserScrolling = $state(false);

    const revertUserScrolling = useDebounce(() => {
        isUserScrolling = false;
    }, 1000);

    $effect(() => {
        if (!ref) return;

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        currentTime;

        const activeLines = document.getElementsByClassName('active-lrc');
        const activeLine = activeLines.item(0) as HTMLAnchorElement|null;
        if (!activeLine) return;

        activeLine.scrollIntoView({
            behavior: scrollBehavior,
            block: scrollAlign
        });
    });

    useEventListener(() => container, 'wheel', () => {
        isUserScrolling = true;
        console.log('scrolling');
        revertUserScrolling();
    });
</script>

<ScrollArea bind:ref class={cn("size-full leading-relaxed", className)}>
    <div bind:this={container} class="h-fit w-full flex flex-col gap-4 pt-20 pb-[100%] px-5">
        {#if typeof lyrics === 'string'}
            {#each lyrics.split('\n') as line, index (index)}
                <p class="block">
                    {line}
                </p>
            {/each}
        {:else}
            {#each lyrics as line, index (index + '-' + line.startTime + '-' + line.endTime)}
                {@const startTime = line.startTime / 1000}
                {@const endTime = line.endTime / 1000}
                {@const isActive = currentTime >= startTime && currentTime <= endTime}
                {@const hasPassed = currentTime > endTime}
                {@const isFuture = currentTime < startTime}
                <a
                    href="#/"
                    onclick={() => setCurrentTime?.(startTime)}
                    class={cn(
                        "block opacity-50 transition-all duration-500 ease-in-out text-balance",
                        isActive && "active-lrc opacity-100 scale-[1.02]",
                        (hasPassed || isFuture) && !isUserScrolling && "blur-[2px]",
                        hidePassedLines && hasPassed && !isUserScrolling && "opacity-0 pointer-events-none",
                        line.isDuet && "text-end"
                    )}
                >
                    {#each line.words as word, wordIndex (wordIndex + '-' + word.startTime + '-' + word.endTime)}
                        <span class="inline-block">
                            {word.word}
                        </span>
                    {/each}
                </a>
            {/each}
        {/if}
    </div>
</ScrollArea>
