<script lang="ts">
    import type { LyricLine } from '@applemusic-like-lyrics/core';
    import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../ui/empty';
    import { CheckIcon, MicVocalIcon } from '@lucide/svelte';
    import FileInput from '../../../FileInput.svelte';
    import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '../../../../ui/input-group';
    import { parseLrc, parseLyl, parseLys, parseTTML, parseYrc } from '@applemusic-like-lyrics/lyric';
    import { toast } from 'svelte-sonner';
    import { parseLyricsContent, stringifyLyrics } from '$lib/helpers/lyrics';

    let {
        onParse
    }: {
        onParse: (data: {
            content: string;
            lines: LyricLine[];
        }) => void;
    } = $props();

    let isBusy: boolean = $state(false);
    let content: string = $state('');

    async function resolveFromFile(file: File): Promise<LyricLine[]|string> {
        const reader = new FileReader();

        const text: string = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });

        const extension = file.name.split('.').pop()?.toLowerCase();

        switch (extension) {
            case 'ttml':
                return parseTTML(text).lines;
            case 'lrc':
                return parseLrc(text);
            case 'yrc':
                return parseYrc(text);
            case 'lys':
                return parseLys(text);
            case 'lyl':
                return parseLyl(text);
            default:
                return text;
        }
    }

    function parseLyrics(data: LyricLine[]|string) {
        const lines = typeof data !== 'string' ? data : [];
        const content = typeof data === 'string' ? data : stringifyLyrics(lines);

        onParse({ content, lines });
    }

    function parseContent() {
        isBusy = true;

        try {
            parseLyrics(parseLyricsContent(content));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            parseLyrics(content);
        } finally {
            isBusy = false;
        }
    }
</script>

<Empty class="px-0">
    <EmptyHeader class="gap-0">
        <EmptyMedia variant="icon">
            <MicVocalIcon/>
        </EmptyMedia>
        <EmptyTitle>
            Add Track Lyrics
        </EmptyTitle>
        <EmptyDescription>
            Upload a supprted lyrics file or paste the lyrics to start syncing with your track.
        </EmptyDescription>
    </EmptyHeader>
    <EmptyContent class="max-w-lg">
        <FileInput
            disabled={isBusy}
            accept=".lrc,.txt,.ttml,.yrc,.lyl,.lys"
            onchange={async event => {
                const files = event.currentTarget.files;
                if (!files?.length) return;

                isBusy = true;

                try {
                    parseLyrics(await resolveFromFile(files[0]));
                } catch (error) {
                    toast.error('Failed to parse the lyrics file. Please ensure it is in a supported format and try again.');
                    console.error('Error parsing lyrics file:', error);
                } finally {
                    isBusy = false;
                }
            }}
        />
        <InputGroup>
            <InputGroupTextarea
                bind:value={content}
                disabled={isBusy}
                placeholder="Paste lyrics here..."
                class="min-h-40"
            />
            <InputGroupAddon align="block-end">
                <InputGroupButton
                    class="ms-auto"
                    variant="secondary"
                    size="sm"
                    disabled={isBusy || !content.trim()}
                    onclick={parseContent}
                >
                    <CheckIcon/>
                    Add Lyrics
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
        <p class="text-xs">
            Find supported lyrics from <a href="https://lrclib.foo.ng/search" target="_blank" rel="noopener noreferrer" class="text-primary underline">lrclib.foo.ng</a>
        </p>
    </EmptyContent>
</Empty>
