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

export function parseLyricsContent(content: string): LyricLine[] {
    try {
        return parseLrc(content);
    } catch (e) {
        console.warn('Not LRC format, trying other formats...', e);
    }

    try {
        return parseTTML(content).lines;
    } catch (e) {
        console.warn('Not TTML format, trying other formats...', e);
    }

    try {
        return parseLyl(content);
    } catch (e) {
        console.warn('Not LYL format, trying other formats...', e);
    }

    try {
        return parseLys(content);
    } catch (e) {
        console.warn('Not LYS format, trying other formats...', e);
    }

    try {
        return parseYrc(content);
    } catch (e) {
        console.warn('Not YRC format, treating as TXT', e);
    }

    throw new Error('Unsupported lyrics format');
}

export function stringifyLyrics(lyrics: LyricLine[]): string {
    return lyrics.map(line => line.words.map(word => word.word).join('')).join('\n');
}

export interface LyricsTimelineData {
    passedLines: number[];
    activeLines: Map<number, number[]>;
    futureLines: number[];
}

export function getLyricsTimeline(lyrics: LyricLine[], currentTime: number): LyricsTimelineData {
    const passedLines: number[] = [];
    const activeLines = new Map<number, number[]>();
    const futureLines: number[] = [];

    for (let i = 0; i < lyrics.length; i++) {
        const line = lyrics[i];

        if (currentTime > line.endTime) {
            passedLines.push(i);
            continue;
        } else if (currentTime < line.startTime) {
            futureLines.push(i);
            continue;
        }

        const activeWords: number[] = [];

        for (let j = 0; j < line.words.length; j++) {
            const word = line.words[j];

            const wordStartTime = word.startTime;

            if (currentTime >= wordStartTime) {
                activeWords.push(j);
            }
        }

        activeLines.set(i, activeWords);
    }

    return { passedLines, activeLines, futureLines };
}
