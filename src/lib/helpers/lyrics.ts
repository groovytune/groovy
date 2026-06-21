import type { LyricLine } from '@applemusic-like-lyrics/core';
import { parseLrc, parseTTML } from '@applemusic-like-lyrics/lyric';

export function parseLyrics(lyrics: { format: string; content: string }): LyricLine[]|string {
    switch (lyrics.format) {
        case 'LRC': return parseLrc(lyrics.content);
        case 'TTML': return parseTTML(lyrics.content).lines;
        case 'TXT':
        default:
            return lyrics.content;
    }
}

export function parseLyricsContent(content: string): LyricLine[] {
    if (!content || !content.trim().length) {
        throw new Error('Lyrics content is empty');
    }

    try {
        const lrc = parseLrc(content);
        if (!lrc || !lrc.length) throw new Error('Parsed LRC content is empty');
        return lrc;
    } catch (e) {
        console.warn('Not LRC format, trying other formats...', e);
    }

    try {
        const ttml = parseTTML(content).lines;
        if (!ttml || !ttml.length) throw new Error('Parsed TTML content is empty');
        return ttml;
    } catch (e) {
        console.warn('Not TTML format, trying other formats...', e);
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
