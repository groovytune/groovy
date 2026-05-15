<script lang="ts">
    import type { LyricLine } from '@applemusic-like-lyrics/core';
    import { ScrollArea } from '$lib/components/ui/scroll-area';
    import type { ClassValue } from 'clsx';
    import { cn } from '$lib/helpers/utils';
    import { useDebounce, useEventListener } from 'runed';

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
        if (!enableBlur) return "opacity-50";

        return distanceFromCurrent <= 10
            ? "opacity-50 blur-[2px]"
            : distanceFromCurrent < 20
                ? "opacity-40 blur-[3px]"
                : distanceFromCurrent < 30
                    ? "opacity-30 blur-xs"
                    : "opacity-25 blur-[5px]"
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
    <div class={cn("h-fit w-full flex flex-col gap-8 pt-20 pb-[100svh] px-5", containerClass)}>
        {#if typeof lyrics === 'string'}
            {#each lyrics.split('\n') as line, index (index)}
                <p class="block">
                    {line}
                </p>
            {/each}
        {:else}
            {#each lyrics as line, lineIndex (lineIndex)}
                {@const lineStartTime = Number((line.startTime / 1000).toFixed(2))}
                {@const lineEndTime = Number((line.endTime / 1000).toFixed(2))}
                {@const isLineActive = currentTime >= lineStartTime && currentTime <= lineEndTime}
                {@const isLinePassed = currentTime > lineEndTime}
                {@const isLineFuture = currentTime < lineStartTime}
                {@const distanceFromCurrent = calculateLineTimeDistance(line)}
                <a
                    href="#/"
                    data-start-time={lineStartTime}
                    data-end-time={lineEndTime}
                    data-is-active={isLineActive}
                    data-distance-from-current={distanceFromCurrent}
                    onclick={() => setCurrentTime?.(lineStartTime)}
                    style="content-visibility: auto; will-change: transform;"
                    class={cn(
                        "block transition-all duration-500 ease-in-out text-balance",
                        isLineActive && "active-lrc",
                        (isLinePassed || isLineFuture) && !isUserScrolling && getOpacityBlur(distanceFromCurrent),
                        hidePassedLines && isLinePassed && !isUserScrolling && "opacity-0 pointer-events-none",
                        line.isDuet && "text-end"
                    )}
                    class:text-sm={line.isBG}
                >
                    {#each line.words as word, wordIndex (wordIndex)}
                        {@const wordStartTime = Number((word.startTime / 1000).toFixed(2))}
                        {@const wordEndTime = Number((word.endTime / 1000).toFixed(2))}
                        {@const isWordActive = currentTime >= wordStartTime && currentTime <= wordEndTime}
                        <span
                            style="will-change: transform; white-space-collapse: preserve-spaces;"
                            class={cn(
                                "inline-block opacity-50 transition-all duration-500 ease-in-out",
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
