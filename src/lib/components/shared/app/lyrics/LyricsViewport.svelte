<script lang="ts">
    import type { LyricLine } from '@applemusic-like-lyrics/core';
    import { ScrollArea } from '$lib/components/ui/scroll-area';
    import type { ClassValue } from 'clsx';
    import { cn } from '$lib/helpers/utils';
    import { useDebounce, useEventListener } from 'runed';
    import { getLyricsTimeline } from '$lib/helpers/lyrics';
    import { untrack } from 'svelte';

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

    const revertUserScrolling = useDebounce(() => isUserScrolling = false, 5000);

    let currentTimeMs = $derived(Math.round(currentTime * 1000));
    let lyricsTimeline = $derived(lyrics && typeof lyrics !== 'string' ? getLyricsTimeline(lyrics, currentTimeMs) : null);
    let isDone = $derived(lyricsTimeline?.futureLines.length === 0 && lyricsTimeline?.activeLines.size === 0);

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
        const lines = document.getElementsByClassName('active-lrc');
        const active = lines.item(0) as HTMLAnchorElement|null;
        if (isUserScrolling) return;

        let top: number|null = null;

        if (active) {
            switch (scrollBlock) {
                case 'start':
                    top = active.offsetTop - 50;
                    break;
                case 'center':
                    top = active.offsetTop - (viewportRef!.clientHeight / 2) + (active.clientHeight / 2);
                    break;
                case 'end':
                    top = active.offsetTop + active.clientHeight - viewportRef!.clientHeight;
                    break;
                case 'nearest': {
                    const lineTop = active.offsetTop;
                    const lineBottom = lineTop + active.clientHeight;
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
        }

        if (top !== null || untrack(() => isDone)) {
            requestAnimationFrame(() => viewportRef!.scrollTo({
                top: top ?? 0,
                behavior: scrollBehavior,
            }));
        }
    }

    function getOpacityBlur(distanceFromCurrent: number): string {
        let opacity: number;
        let blur: number;

        if (distanceFromCurrent <= 2) {
            opacity = 25;
            blur = 2;
        } else if (distanceFromCurrent <= 5) {
            opacity = 30;
            blur = 3;
        } else if (distanceFromCurrent <= 20) {
            opacity = 30;
            blur = 5;
        } else {
            opacity = 10;
            blur = 5;
        }

        return `opacity: ${opacity}%; filter: blur(${enableBlur ? blur : 0}px);`;
    }

    function calculateLineIndexDistance(index: number): number {
        const activeIndices = lyricsTimeline?.activeLines.keys().toArray();
        if (!activeIndices?.length) return 0;

        const distances = activeIndices.map(activeIndex => Math.abs(activeIndex - index));
        return Math.min(...distances);
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
                {@const activeWords = lyricsTimeline?.activeLines.get(lineIndex)}
                {@const isLineActive = activeWords !== undefined}
                {@const isLinePassed = !isLineActive && !!lyricsTimeline?.passedLines.includes(lineIndex)}
                {@const isLineFuture = !isLineActive && !!lyricsTimeline?.futureLines.includes(lineIndex)}
                {@const distanceFromCurrent = calculateLineIndexDistance(lineIndex)}
                <a
                    href="#/"
                    data-line-index={lineIndex}
                    data-distance-from-current={distanceFromCurrent}
                    style="content-visibility: auto; will-change: auto; interpolate-size: allow-keywords; {(isLinePassed || isLineFuture) && !isUserScrolling ? getOpacityBlur(distanceFromCurrent) : ''}"
                    class={cn(
                        "block transition-all duration-500 ease-in-out text-balance mt-8 h-fit",
                        lineIndex === 0 && "mt-0",
                        isLineActive && "active-lrc",
                        hidePassedLines && isLinePassed && !isUserScrolling && "opacity-0! pointer-events-none blur-none",
                        isDone && isLinePassed && "opacity-50! pointer-events-none blur-none!",
                        line.isDuet && "text-end",
                        line.isBG && "text-[0.6em] mt-2 mb-2 font-semibold",
                        line.isBG && isLineFuture && "opacity-10!",
                    )}
                    onclick={e => {
                        e.preventDefault();
                        setCurrentTime?.(parseFloat((line.startTime / 1000).toFixed(3)));
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
