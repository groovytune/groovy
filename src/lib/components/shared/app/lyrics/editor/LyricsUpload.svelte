<script lang="ts">
    import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '$lib/components/ui/empty';
    import { CheckIcon, MicVocalIcon } from '@lucide/svelte';
    import FileInput from '../../../FileInput.svelte';
    import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '$lib/components/ui/input-group';
    import { parseLrc, parseTTML, type LyricLine } from '@applemusic-like-lyrics/lyric';
    import { toast } from 'svelte-sonner';
    import { parseLyricsContent } from '$lib/helpers/lyrics';
    import type { LyricsFormat } from '../../../../../server/prisma/enums';

    let {
        onParse
    }: {
        onParse: (data: {
            content: string;
            format: LyricsFormat;
            lines: LyricLine[];
        }) => void;
    } = $props();

    let isBusy: boolean = $state(false);
    let content: string = $state('');

    async function resolveFromFile(file: File): Promise<{ raw: string; lines: LyricLine[]; format: LyricsFormat; }> {
        const reader = new FileReader();

        const text: string = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });

        const extension = file.name.split('.').pop()?.toLowerCase();

        switch (extension) {
            case 'lrc':
                return { raw: text, lines: parseLrc(text), format: 'LRC' };
            case 'ttml':
                return { raw: text, lines: parseTTML(text).lines, format: 'TTML' };
            default:
                try {
                    return { raw: text, ...parseLyricsContent(text) };
                } catch {
                    return { raw: text, lines: [], format: 'TXT' };
                }
        }
    }

    function parseLyrics(data: { raw: string; lines: LyricLine[]; format: LyricsFormat; }) {
        onParse({
            content: data.raw,
            lines: data.lines,
            format: typeof data !== 'string' ? data.format : 'TXT'
        });
    }

    function parseContent() {
        isBusy = true;

        try {
            parseLyrics({ raw: content, ...parseLyricsContent(content) });
        } catch {
            parseLyrics({ raw: content, lines: [], format: 'TXT' });
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
            accept=".lrc,.txt,.ttml"
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
