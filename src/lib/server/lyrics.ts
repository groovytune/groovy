import type z from 'zod';
import type { newLyricsSchema } from '../schema/lyrics';
import { parseLrc } from '@applemusic-like-lyrics/lyric';
import { TTMLParser } from '@applemusic-like-lyrics/ttml';
import { DOMParser as XMLDOMParser } from '@xmldom/xmldom';

export namespace Lyrics {
    export const parser = new TTMLParser({
        domParser: typeof DOMParser !== 'undefined' ? new DOMParser() : new XMLDOMParser(),
    });

    export function isValidLyrics(data: z.infer<typeof newLyricsSchema>): boolean {
        const { format, content } = data;

        switch (format) {
            case 'LRC':
                return isValidLRC(content);
            case 'TTML':
                return isValidTTML(content);
            case 'TXT':
                return true;
            default:
                return false;
        }
    }

    function isValidLRC(content: string): boolean {
        const lines = parseLrc(content);
        return lines.length > 0;
    }

    function isValidTTML(content: string): boolean {
        const data = parser.parse(content);
        return data.lines.length > 0;
    }
}
