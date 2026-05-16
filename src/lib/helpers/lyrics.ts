import type { LyricLine } from '@applemusic-like-lyrics/core';
import type { Lyrics } from '../server/prisma/browser';
import { parseLrc, parseLyl, parseLys, parseTTML, parseYrc } from '@applemusic-like-lyrics/lyric';

export function parseLyrics(lyrics: Lyrics): LyricLine[]|string {
    switch (lyrics.format) {
        case 'LRC': return parseLrc(lyrics.content);
        case 'TTML': return parseTTML(lyrics.content).lines;
        case 'LYL': return parseLyl(lyrics.content);
        case 'LYS': return parseLys(lyrics.content);
        case 'YRC': return parseYrc(lyrics.content);
        case 'TXT': return lyrics.content;
    }
}

export function stringifyLyrics(lyrics: LyricLine[]): string {
    return lyrics.map(line => line.words.map(word => word.word).join('')).join('\n');
}

export function getActiveLines(lyrics: LyricLine[], currentTime: number): Map<number, number[]> {
    const activeLines = new Map<number, number[]>();

    for (let i = 0; i < lyrics.length; i++) {
        const line = lyrics[i];

        const lineStartTime = line.startTime / 1000;
        const lineEndTime = line.endTime / 1000;

        if (currentTime < lineStartTime || currentTime > lineEndTime) continue;

        const activeWords: number[] = [];

        for (let j = 0; j < line.words.length; j++) {
            const word = line.words[j];

            const wordStartTime = word.startTime / 1000;

            if (currentTime >= wordStartTime) {
                activeWords.push(j);
            }
        }

        activeLines.set(i, activeWords);
    }

    return activeLines;
}
