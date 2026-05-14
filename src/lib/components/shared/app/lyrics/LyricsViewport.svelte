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
        viewportRef = $bindable(null),
        class: className,
        viewportClass,
        containerClass,
        hidePassedLines = true,
        scrollBlock = 'center',
        scrollBehavior = 'smooth'
    }: {
        currentTime: number;
        lyrics: LyricLine[]|string;
        setCurrentTime?: (time: number) => void;
        ref?: HTMLElement|null;
        viewportRef?: HTMLElement|null;
        class?: ClassValue;
        viewportClass?: ClassValue;
        containerClass?: ClassValue;
        hidePassedLines?: boolean;
        scrollBlock?: 'start'|'center'|'end'|'nearest';
        scrollBehavior?: ScrollBehavior;
    } = $props();

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
            block: scrollBlock,
        });
    });

    useEventListener(() => viewportRef, ['wheel', 'touchmove'], () => {
        isUserScrolling = true;
        console.log('scrolling');
        revertUserScrolling();
    });
</script>

<ScrollArea
    bind:viewportRef
    bind:ref
    class={cn("size-full leading-relaxed", className)}
    viewportClasses={cn("scroll-pt-20", viewportClass)}
>
    <div class={cn("h-fit w-full flex flex-col gap-4 pt-20 pb-[100svh] px-5", containerClass)}>
        {#if typeof lyrics === 'string'}
            {#each lyrics.split('\n') as line, index (index)}
                <p class="block">
                    {line}
                </p>
            {/each}
        {:else}
            {#each lyrics as line, index (index + '-' + line.startTime + '-' + line.endTime)}
                {@const lineStartTime = line.startTime / 1000}
                {@const lineEndTime = line.endTime / 1000}
                {@const isLineActive = currentTime >= lineStartTime && currentTime <= lineEndTime}
                {@const isLinePassed = currentTime > lineEndTime}
                {@const isLineFuture = currentTime < lineStartTime}
                <a
                    href="#/"
                    onclick={() => setCurrentTime?.(lineStartTime)}
                    class={cn(
                        "block transition-all duration-500 ease-in-out text-balance",
                        isLineActive && "active-lrc scale-[1.01]",
                        (isLinePassed || isLineFuture) && !isUserScrolling && "blur-[2px]",
                        hidePassedLines && isLinePassed && !isUserScrolling && "opacity-0 pointer-events-none",
                        line.isDuet && "text-end"
                    )}
                >
                    {#each line.words as word, wordIndex (wordIndex + '-' + word.startTime + '-' + word.endTime)}
                        {@const wordStartTime = word.startTime / 1000}
                        {@const wordEndTime = word.endTime / 1000}
                        {@const isWordActive = currentTime >= wordStartTime && currentTime <= wordEndTime}
                        <span
                            class={cn(
                                "inline-block whitespace-pre-wrap opacity-50 transition-all duration-300 ease-in-out",
                                isLineActive && currentTime >= wordEndTime && "opacity-100",
                                isWordActive && "opacity-100"
                            )}
                        >
                            {word.word}
                        </span>
                    {/each}
                </a>
            {/each}
        {/if}
    </div>
</ScrollArea>
