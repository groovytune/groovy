<script lang="ts">
    import { formatDuration } from '$lib/helpers/utils';
    import type { SuperForm } from 'sveltekit-superforms';
    import type z from 'zod';
    import type { newLyricsSchema } from '$lib/schema/lyrics';
    import { Item, ItemActions, ItemContent, ItemMedia } from '$lib/components/ui/item';
    import { Button } from '$lib/components/ui/button';
    import { PlayIcon } from '@lucide/svelte';
    import { Textarea } from '$lib/components/ui/textarea';

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

    const { form: formData } = form;

    let highlightedInput: HTMLTextAreaElement|null = $derived(document.querySelector(`[data-lyric-index="${highlightedIndex}"] textarea`));

    $effect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        lines;

        $formData.format = 'LRC';
        $formData.content = toLrcString();
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

    function toLrcString() {
        let result = '';

        for (const line of lines) {
            const text = line.text;
            const timestamp = line.startTime;

            if (timestamp === undefined) continue;

            result += `[${formatDuration(timestamp, 'mm:ss.S')}]${text}\n`;
        }

        return result.trimEnd();
    }
</script>

<svelte:window
    onkeydown={event => {
        const hasModifier = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
        const isFocusedOnInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '');
        if (hasModifier || isFocusedOnInput && event.key === 'Backspace') return;

        switch (event.key) {
            case 'Enter': {
                event.preventDefault();

                lines[highlightedIndex].startTime = currentTime;
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
                    onclick={e => {
                        e.preventDefault();

                        if (timeStamp !== undefined) {
                            currentTime = timeStamp;
                        }
                    }}
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
