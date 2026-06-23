<script lang="ts">
    import { formatDuration } from '$lib/helpers/utils';
    import type { SuperForm } from 'sveltekit-superforms';
    import type z from 'zod';
    import type { newLyricsSchema } from '$lib/schema/lyrics';
    import { Item, ItemActions, ItemContent, ItemMedia } from '$lib/components/ui/item';
    import { Button } from '$lib/components/ui/button';
    import { ArrowDownIcon, ArrowUpIcon, BetweenHorizontalEndIcon, PlayIcon } from '@lucide/svelte';
    import { Textarea } from '$lib/components/ui/textarea';
    import type { LyricsFormat } from '$lib/server/prisma/enums';

    let {
        currentTime = $bindable(0),
        lines = $bindable([]),
        highlightedIndex = $bindable(0),
        form
    }: {
        currentTime: number;
        lines: { text: string; startTime?: number; }[];
        highlightedIndex?: number;
        form: SuperForm<z.infer<typeof newLyricsSchema>>;
    } = $props();

    // svelte-ignore state_referenced_locally
    const { form: formData } = form;

    let highlightedInput: HTMLTextAreaElement|null = $derived(document.querySelector(`[data-lyric-index="${highlightedIndex}"] textarea`));

    $effect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        lines;

        const { content, format } = toLyricsData();

        $formData.format = format;
        $formData.content = content;
    });

    $effect(() => {
        if (highlightedInput && document.activeElement?.tagName == highlightedInput.tagName) {
            highlightedInput.focus();
        }
    });

    function setCurrentLyricIndex(index: number) {
        highlightedIndex = Math.max(0, Math.min(lines.length - 1, index));

        const currentLine = document.querySelector(`[data-lyric-index="${highlightedIndex}"]`);
        if (currentLine) currentLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function toLyricsData(): { content: string; format: LyricsFormat; } {
        let result = '';

        if (lines.every(line => line.startTime === undefined)) {
            return { content: lines.map(line => line.text).join('\n'), format: 'TXT' };
        }

        for (const line of lines) {
            const text = line.text;
            const timestamp = line.startTime;

            if (timestamp === undefined) continue;

            result += `[${formatDuration(timestamp, 'mm:ss.S')}]${text}\n`;
        }

        return {
            content: result.trimEnd(),
            format: 'LRC'
        };
    }

    function setLyricTimestamp(index: number, time: number) {
        if (index < 0 || index >= lines.length) return;

        const line = lines[index];
        if (!line) return;

        line.startTime = time;
        lines[index] = line;

        setCurrentLyricIndex(index + 1);
    }
</script>

<svelte:window
    onkeydown={event => {
        const hasModifier = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
        const isFocusedOnInput = ['INPUT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement?.tagName || '');
        if (hasModifier || isFocusedOnInput && event.key === 'Backspace') return;

        switch (event.key) {
            case 'Enter': {
                event.preventDefault();

                setLyricTimestamp(highlightedIndex, currentTime);
                setCurrentLyricIndex(highlightedIndex + 1);
                break;
            }
            case 'Backspace':
                event.preventDefault();

                delete lines[highlightedIndex].startTime;
                break;
            case 'ArrowUp':
            case 'ArrowDown': {
                event.preventDefault();

                const direction = event.key === 'ArrowUp' ? -1 : 1;
                setCurrentLyricIndex(highlightedIndex + direction);
                break;
            }
        }
    }}
/>

<div class="flex flex-col gap-2 w-full">
    {#each lines as line, index (index)}
        {@const timeStamp = line.startTime}
        {@const isActive = timeStamp !== undefined && currentTime >= timeStamp}
        {@const isHighlighted = index === highlightedIndex}
        <Item
            data-lyric-index={index}
            class={[
                "p-0 rounded-lg items-start",
            ]}
            variant="default"
            size="sm"
        >
            <ItemMedia class="flex-col gap-2">
                <Button
                    class="w-16 cursor-pointer h-fit py-1 text-xs font-mono"
                    variant={isHighlighted ? "default" : "outline"}
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
                </Button>
                <Button
                    class="w-16 cursor-pointer h-fit py-1 text-xs font-mono"
                    variant="ghost"
                >
                    {#if isActive}
                        <span class="text-green-500">
                            Reached
                        </span>
                    {:else}
                        <span class="text-gray-500">
                            Pending
                        </span>
                    {/if}
                </Button>
            </ItemMedia>
            <ItemContent>
                <Textarea
                    bind:value={line.text}
                    onfocus={() => setCurrentLyricIndex(index)}
                    class={[
                        "h-8 text-sm",
                        isHighlighted && 'border-primary ring-primary/20 ring-2'
                    ]}
                    placeholder=""
                />
            </ItemContent>
            <ItemActions>
                <Button
                    onclick={e => {
                        e.preventDefault();

                        if (timeStamp !== undefined) {
                            currentTime = timeStamp;
                        }
                    }}
                    class="hidden"
                    variant={isHighlighted ? "default" : "outline"}
                    size="icon-sm"
                >
                    <PlayIcon/>
                </Button>
            </ItemActions>
        </Item>
    {/each}
</div>
<div class="fixed bottom-30 sm:bottom-14 z-50 left-1/2 -translate-x-1/2 flex md:hidden gap-1 lg:px-7 px-5 [&_button]:pointer-events-auto">
    <Button variant="secondary" size="icon-lg" onclick={() => setCurrentLyricIndex(highlightedIndex - 1)}>
        <ArrowUpIcon/>
    </Button>
    <Button variant="default" size="lg" onclick={() => setLyricTimestamp(highlightedIndex, currentTime)}>
        <BetweenHorizontalEndIcon/>
        Update Timestamp
    </Button>
    <Button variant="secondary" size="icon-lg" onclick={() => setCurrentLyricIndex(highlightedIndex + 1)}>
        <ArrowDownIcon/>
    </Button>
</div>
