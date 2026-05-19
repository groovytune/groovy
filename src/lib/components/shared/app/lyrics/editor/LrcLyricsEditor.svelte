<script lang="ts">
    import { SvelteMap } from 'svelte/reactivity';
    import { formatDuration } from '$lib/helpers/utils';
    import { Badge } from '../../../../ui/badge';
    import type { SuperForm } from 'sveltekit-superforms';
    import type z from 'zod';
    import type { newLyricsSchema } from '$lib/schema/lyrics';

    let {
        currentTime = $bindable(0),
        lyrics = $bindable(''),
        timeData = new SvelteMap(),
        currentLyricIndex = $bindable(0),
        form
    }: {
        currentTime: number;
        lyrics: string;
        timeData?: Map<number, number>;
        currentLyricIndex?: number;
        form: SuperForm<z.infer<typeof newLyricsSchema>>;
    } = $props();

    const { form: formData } = form;

    let lines = $derived(lyrics.split('\n'));

    $effect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        timeData; lines; lyrics;

        $formData.format = 'LRC';
        $formData.content = toLrcString();
    });

    function setCurrentLyricIndex(index: number) {
        currentLyricIndex = Math.max(0, Math.min(lines.length - 1, index));

        const currentLine = document.querySelector(`[data-lyric-index="${currentLyricIndex}"]`);
        if (currentLine) currentLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function toLrcString() {
        const data: { timestamp: number; text: string; }[] = [];

        for (const [index, timestamp] of timeData) {
            const text = lines[index];
            if (!text) continue;

            data.push({
                timestamp,
                text: `[${formatDuration(timestamp, 'mm:ss.S')}] ${text}`
            });
        }

        return data.sort((a, b) => a.timestamp - b.timestamp).map(line => line.text).join('\n');
    }
</script>

<svelte:window
    onkeydown={event => {
        const hasModifier = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
        const isFocusedOnInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '');
        if (hasModifier || isFocusedOnInput) return;

        switch (event.key) {
            case 'Enter': {
                event.preventDefault();

                timeData.set(currentLyricIndex, currentTime);
                setCurrentLyricIndex(currentLyricIndex + 1);
                break;
            }
            case 'Backspace':
                event.preventDefault();

                timeData.delete(currentLyricIndex);
                break;
            case 'ArrowUp':
            case 'ArrowDown': {
                event.preventDefault();

                const direction = event.key === 'ArrowUp' ? -1 : 1;
                setCurrentLyricIndex(currentLyricIndex + direction);
                break;
            }
        }
    }}
/>

<div class="flex flex-col gap-2">
    {#each lines as line, index (index)}
        {@const timeStamp = timeData.get(index)}
        {@const isActive = timeStamp !== undefined && currentTime >= timeStamp}
        {@const isCurrent = index === currentLyricIndex}
        <div
            data-lyric-index={index}
            class="flex gap-2 font-medium"
            class:text-muted-foreground={!isActive}
            class:text-primary={isCurrent}
        >
            <Badge
                class="w-16 cursor-pointer h-fit"
                variant={isCurrent ? "default" : "outline"}
                onclick={e => {
                    e.preventDefault();

                    if (timeStamp !== undefined) {
                        currentTime = timeStamp;
                    }
                }}
            >
                {#if timeStamp !== undefined}
                    {formatDuration(timeStamp , 'mm:ss')}
                {:else}
                    --:--
                {/if}
            </Badge>
            <a
                href="#/"
                onclick={e => {
                    e.preventDefault();
                    setCurrentLyricIndex(index);
                }}
            >
                {line}
            </a>
        </div>
    {/each}
</div>
