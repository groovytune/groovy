<script lang="ts">
    import type { LyricLine } from '@applemusic-like-lyrics/core';
    import { ScrollArea } from '$lib/components/ui/scroll-area';
    import type { ClassValue } from 'clsx';
    import { cn } from '$lib/helpers/utils';
    import { useDebounce, useEventListener } from 'runed';
    import { getActiveLines } from '../../../../helpers/lyrics';

    let {
        currentTime,
        lyrics,
        setCurrentTime,
        ref = $bindable(null),
        viewportRef = $bindable(null),
        isUserScrolling = $bindable(false),
        class: className,
        viewportClass,
        containerClass,
        hidePassedLines = true,
        enableBlur = true,
        scrollBlock = 'center',
        scrollBehavior = 'smooth'
    }: {
        currentTime: number;
        lyrics: LyricLine[]|string;
        setCurrentTime?: (time: number) => void;
        ref?: HTMLElement|null;
        viewportRef?: HTMLElement|null;
        isUserScrolling?: boolean;
        class?: ClassValue;
        viewportClass?: ClassValue;
        containerClass?: ClassValue;
        hidePassedLines?: boolean;
        enableBlur?: boolean;
        scrollBlock?: 'start'|'center'|'end'|'nearest';
        scrollBehavior?: ScrollBehavior;
    } = $props();

    const activeLines = $derived(lyrics && typeof lyrics !== 'string' ? getActiveLines(lyrics, currentTime) : null);

    const revertUserScrolling = useDebounce(() => {
        isUserScrolling = false;
    }, 5000);

    $effect(() => {
        if (!viewportRef) return;

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        currentTime;
        scrollToCurrentLine();
    });

    useEventListener(() => viewportRef, ['wheel', 'touchmove'], () => {
        isUserScrolling = true;
        revertUserScrolling();
    });

    function scrollToCurrentLine() {
        const activeLines = document.getElementsByClassName('active-lrc');
        const activeLine = activeLines.item(0) as HTMLAnchorElement|null;
        if (isUserScrolling || !activeLine) return;

        let top: number = 0;

        switch (scrollBlock) {
            case 'start':
                top = activeLine.offsetTop - 50;
                break;
            case 'center':
                top = activeLine.offsetTop - (viewportRef!.clientHeight / 2) + (activeLine.clientHeight / 2);
                break;
            case 'end':
                top = activeLine.offsetTop + activeLine.clientHeight - viewportRef!.clientHeight;
                break;
            case 'nearest': {
                const lineTop = activeLine.offsetTop;
                const lineBottom = lineTop + activeLine.clientHeight;
                const viewTop = viewportRef!.scrollTop;
                const viewBottom = viewTop + viewportRef!.clientHeight;

                if (lineTop < viewTop) {
                    top = lineTop;
                } else if (lineBottom > viewBottom) {
                    top = lineBottom - viewportRef!.clientHeight;
                } else {
                    top = viewportRef!.scrollTop;
                }
            }
        }

        requestAnimationFrame(() => viewportRef!.scrollTo({
            top,
            behavior: scrollBehavior,
        }));
    }

    function getOpacityBlur(distanceFromCurrent: number): string {
        let opacity: number;
        let blur: number;

        if (distanceFromCurrent <= 10) {
            opacity = 50;
            blur = 2;
        } else if (distanceFromCurrent <= 20) {
            opacity = 40;
            blur = 3;
        } else if (distanceFromCurrent <= 30) {
            opacity = 30;
            blur = 5;
        } else {
            opacity = 25;
            blur = 5;
        }

        return `opacity-${opacity} blur-[${enableBlur ? blur : 0}px]`;
    }

    function calculateLineTimeDistance(line: LyricLine): number {
        const lineStartTime = line.startTime / 1000;
        const lineEndTime = line.endTime / 1000;
        return Math.round(Math.min(Math.abs(currentTime - lineStartTime), Math.abs(currentTime - lineEndTime)));
    }
</script>

<ScrollArea
    bind:viewportRef
    bind:ref
    class={cn("size-full leading-relaxed", className)}
    viewportClasses={cn("scroll-pt-20", viewportClass)}
>
    <div class={cn("h-fit w-full flex flex-col pt-20 pb-[100svh] px-5", containerClass)}>
        {#if typeof lyrics === 'string'}
            {#each lyrics.split('\n') as line, index (index)}
                <p class="block">
                    {line}
                </p>
            {/each}
        {:else}
            {#each lyrics as line, lineIndex (lineIndex)}
                {@const lineStartTime = line.startTime / 1000}
                {@const lineEndTime = line.endTime / 1000}
                {@const activeWords = activeLines?.get(lineIndex)}
                {@const isLinePassed = currentTime > lineEndTime}
                {@const isLineFuture = currentTime < lineStartTime}
                {@const isLineActive = activeWords !== undefined}
                {@const distanceFromCurrent = calculateLineTimeDistance(line)}
                <a
                    href="#/"
                    data-line-index={lineIndex}
                    data-distance-from-current={distanceFromCurrent}
                    style="content-visibility: auto; will-change: auto; interpolate-size: allow-keywords;"
                    class={cn(
                        "block transition-all duration-500 ease-in-out text-balance mt-8 h-fit",
                        lineIndex === 0 && "mt-0",
                        isLineActive && "active-lrc",
                        (isLinePassed || isLineFuture) && !isUserScrolling && getOpacityBlur(distanceFromCurrent),
                        hidePassedLines && isLinePassed && !isUserScrolling && "opacity-0 pointer-events-none blur-none",
                        line.isDuet && "text-end",
                        line.isBG && "text-[0.6em] mt-2 mb-2 font-semibold",
                        line.isBG && isLineFuture && "opacity-10"
                    )}
                    onclick={e => {
                        e.preventDefault();
                        setCurrentTime?.(lineStartTime);
                    }}
                >
                    {#each line.words as word, wordIndex (wordIndex)}
                        {@const isWordActive = isLineActive && activeWords.includes(wordIndex)}
                        <span
                            style="will-change: auto;"
                            class={cn(
                                "opacity-50 transition-all duration-500 ease-in-out",
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
