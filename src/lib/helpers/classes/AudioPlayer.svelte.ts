import type { Track as RawTrack } from '$lib/server/prisma/browser';
import { Context, resource, useEventListener } from 'runed';
import { ImageFormat } from 'appwrite';
import coverPlaceholder from '$lib/assets/cover.webp';
import { ReleaseInfoCache } from './ReleaseInfoCache.svelte';
import { Image } from '$lib/client/image';
import { resolve } from '$app/paths';
import { QueueTrack } from './QueueTrack';
import { LyricsCache } from './LyricsCache.svelte';
import { shuffleArray } from '../utils';

export class AudioPlayer {
    public hidden: boolean = $state(false);
    public audio: HTMLAudioElement|null = $state(null);
    public releaseCache: ReleaseInfoCache = new ReleaseInfoCache();
    public lyricsCache: LyricsCache = new LyricsCache();

    public queue: QueueTrack[] = $state([]);
    public history: QueueTrack[] = $state([]);
    public current: QueueTrack|null = $state(null);
    public currentTrack: AudioPlayer.Track|null = $derived(this.current?.track ?? null);

    public repeat: AudioPlayer.Repeat = $state('none');
    public shuffled: boolean = $state(false);

    public status: AudioPlayer.Status = $state('stopped');
    public paused: boolean = $state(true);
    public volume: number = $state(1);
    public duration: number = $state(0);
    public currentTime: number = $state(0);
    public isDurationEstimated: boolean = $state(true);

    public frameId: number = 0;
    public lastFrameTime: number = -1;

    public skippable: boolean = $derived(!!this.queue.length && !!this.audio);
    public previousable: boolean = $derived(!!this.history.length && !!this.audio);

    public progress: number = $derived(
        this.audio && this.currentTrack
            ? (this.currentTime / this.duration) * 100
            : 0
    );

    public releaseInfo = resource(
        () => this.currentTrack?.releaseId,
        async releaseId => {
            if (!releaseId) return null;

            return this.releaseCache.fetchInfo({ releaseId, type: 'release' });
        },
        { debounce: 200 }
    );

    public artistInfo = resource(
        () => this.currentTrack?.releaseId,
        async releaseId => {
            if (!releaseId) return null;

            return this.releaseCache.fetchInfo({ releaseId, type: 'artist' });
        },
        { debounce: 200 }
    );

    public lyrics = resource(
        () => this.currentTrack?.id,
        async trackId => {
            if (!trackId) return null;

            const lyrics = await this.lyricsCache
                .fetchLyrics(trackId)
                .catch(() => null);

            return lyrics;
        },
        { debounce: 200 }
    );

    public coverURL = $derived(
        this.currentTrack?.cover || this.releaseInfo.current?.cover
            ? Image.getPreviewPath({
                fileId: (this.currentTrack?.cover || this.releaseInfo.current?.cover)!,
                height: 500,
                width: 500,
                output: ImageFormat.Webp
            })
            : coverPlaceholder
    );

    public previewCoverURL = $derived(
        this.currentTrack?.cover || this.releaseInfo.current?.cover
            ? Image.getPreviewPath({
                fileId: (this.currentTrack?.cover || this.releaseInfo.current?.cover)!,
                height: 300,
                width: 300,
                output: ImageFormat.Webp
            })
            : coverPlaceholder
    );

    public async init(audio?: HTMLAudioElement): Promise<void> {
        this.audio = audio ?? new Audio();

        this.audio.preload = 'auto';
        this.audio.crossOrigin = 'anonymous';
        this.audio.id = 'audio-player-media';

        document.body.appendChild(this.audio);

        useEventListener(
            () => this.audio,
            ['seeked', 'seeking'],
            event => this.currentTime = event.currentTarget.currentTime,
            { passive: true }
        );

        useEventListener(
            () => this.audio,
            ['pause', 'play'],
            event => this.paused = event.currentTarget.paused,
            { passive: true }
        );

        useEventListener(
            () => this.audio,
            'volumechange',
            event => this.volume = event.currentTarget.volume,
            { passive: true }
        );

        useEventListener(
            () => this.audio,
            ['play', 'playing'],
            () => this.status = 'playing',
            { passive: true }
        );

        useEventListener(
            () => this.audio,
            ['waiting', 'loadstart'],
            () => this.status = 'buffering',
            { passive: true }
        );

        useEventListener(
            () => this.audio,
            'durationchange',
            event =>  {
                this.duration = AudioPlayer.getRealDuration(event.currentTarget, this.currentTrack);
                this.isDurationEstimated = !Number.isFinite(event.currentTarget.duration);
            },
            { passive: true }
        );

        useEventListener(
            () => this.audio,
            ['ended', 'abort', 'error', 'loaderror'],
            event => {
                const hasError = event.type === 'error';

                switch (event.type) {
                    case 'ended':
                    case 'error':
                        if (this.repeat === 'one') {
                            if (hasError) {
                                this.next();
                                return;
                            }

                            this.seek(0);
                            this.audio?.play();
                            return;
                        }

                        if (this.queue.length) {
                            this.next();
                            return;
                        }

                        switch (this.repeat) {
                            case 'none': break;
                            case 'all':
                                if (this.history.length) {
                                    this.previous(this.history.length - 1);
                                    return;
                                } else if (this.currentTrack) {
                                    this.seek(0);
                                    this.audio?.play();
                                    return;
                                }
                                break;
                        }

                        this.stop();
                        this.status = hasError ? 'error' : 'stopped';
                        break;
                    case 'abort':
                        this.stop();
                        return;
                }
            }
        );

        this.startFrameLoop();
    }

    public destroy(): void {
        this.stopFrameLoop();
        this.releaseCache.clear();

        this.audio?.pause();
        this.audio?.removeAttribute('src');
        this.audio?.remove();

        this.audio = null;
        this.queue = [];
        this.history = [];
        this.currentTrack = null;
    }

    public startFrameLoop(): void {
        if (typeof requestAnimationFrame === 'undefined') return;

        const onFrame = (frameTime: number) => {
            this.lastFrameTime = frameTime;
            this.currentTime = this.audio?.currentTime ?? 0;

            this.frameId = requestAnimationFrame(onFrame);
        }

        this.frameId = requestAnimationFrame(onFrame);
    }

    public stopFrameLoop(): void {
        if (typeof cancelAnimationFrame === 'undefined') return;

        cancelAnimationFrame(this.frameId);
        this.frameId = 0;
        this.lastFrameTime = -1;
    }

    public add(tracks: AudioPlayer.Track|AudioPlayer.Track[], next: boolean = false): void {
        const trackList: QueueTrack[] = (Array.isArray(tracks) ? tracks : [tracks])
            .map(track => new QueueTrack(track));

        if (next) {
            this.queue.unshift(...trackList);
        } else {
            this.queue.push(...trackList);
        }
    }

    public remove(track: AudioPlayer.Track|string|number, from: 'queue' | 'history' = 'queue'): void {
        const list = from === 'queue' ? this.queue : this.history;
        const index = typeof track === 'object' ? list.findIndex(t => t.id === track.id) : list.findIndex(t => t.id === track);

        if (index !== -1) {
            list.splice(index, 1);
        }
    }

    public async replaceQueue(tracks: (RawTrack|QueueTrack)[], history?: (RawTrack|QueueTrack)[]): Promise<void> {
        this.clear();
        this.queue = tracks.map(track => track instanceof QueueTrack ? track : new QueueTrack(track));
        this.history = (history || []).map(track => track instanceof QueueTrack ? track : new QueueTrack(track));

        const nextTrack = this.queue.shift();

        if (this.current) this.current = nextTrack ?? null;
        if (nextTrack) await this.loadCurrentTrack(nextTrack);
    }

    public async replaceCurrentTrack(track: RawTrack, moveHistory: boolean = true): Promise<void> {
        if (!this.audio) return;

        if (this.current && moveHistory) {
            this.history.unshift(this.current);
        }

        await this.loadCurrentTrack(track);
    }

    public async loadCurrentTrack(track: AudioPlayer.Track|QueueTrack): Promise<void> {
        if (!this.audio) return;

        this.current = track instanceof QueueTrack ? track : new QueueTrack(track);

        const source = resolve('/(app)/api/track/[trackId]/audio', { trackId: this.current.track.id });

        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.src = source;
        this.audio.load();
    }

    public stop(): void {
        if (!this.audio) return;

        if (this.current) {
            this.history.unshift(this.current);
            this.current = null;
        }

        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.removeAttribute('src');

        this.status = 'stopped';
    }

    public async play(track?: RawTrack): Promise<void> {
        if (!this.audio) return;

        if (this.currentTrack) {
            if (track) {
                this.add([track]);
            }

            await this.audio.play();
            return;
        }

        track ??= this.queue.shift() as RawTrack|undefined;
        if (!track) return;

        await this.loadCurrentTrack(track);
        await this.audio.play();
    }

    public async shuffle(shuffle: (tracks: QueueTrack[]) => QueueTrack[] = shuffleArray): Promise<QueueTrack[]> {
        const shuffled = this.queue.map((track, index) => track.regenerateSortId(Date.now() + index));

        this.queue = shuffle(shuffled);
        this.shuffled = true;
        return this.queue;
    }

    public async unshuffle(): Promise<void> {
        this.queue = this.queue.sort((a, b) => a.sortId.localeCompare(b.sortId));
        this.shuffled = false;
    }

    public async pause(): Promise<void> {
        if (!this.paused) {
            this.audio?.pause();
        }
    }

    public async togglePlay(): Promise<void> {
        if (this.paused) {
            await this.audio?.play();
        } else {
            this.audio?.pause();
        }
    }

    public toggleRepeat(): void {
        switch (this.repeat) {
            case 'none':
                this.repeat = 'all';
                break;
            case 'all':
                this.repeat = 'one';
                break;
            case 'one':
                this.repeat = 'none';
                break;
        }
    }

    public async seek(time: number): Promise<void> {
        if (!this.audio || !this.currentTrack || !this.audio.seekable.length || this.isDurationEstimated) return;

        this.currentTime = this.audio.currentTime = Math.min(Math.max(time, 0), this.duration);
    }

    public async setVolume(volume: number): Promise<void> {
        if (!this.audio) return;

        this.audio.volume = volume;
    }

    public async next(index: number = 0): Promise<void> {
        if (!this.audio) return;

        const addToHistory = this.queue.splice(0, index);
        const nextTrack = this.queue.shift();

        if (this.current) {
            this.history.unshift(this.current);
            this.current = nextTrack ?? null;
        }

        if (nextTrack) {
            await this.loadCurrentTrack(nextTrack);
            await this.play();
        }

        for (const track of addToHistory) {
            this.history.unshift(track);
        }
    }

    public async previous(index: number = 0): Promise<void> {
        if (!this.audio) return;

        const addToQueue = this.history.splice(0, index);
        const previousTrack = this.history.shift();

        if (this.current) {
            this.queue.unshift(this.current);
            this.current = previousTrack ?? null;
        }

        if (previousTrack) {
            await this.loadCurrentTrack(previousTrack);
            await this.play();
        }

        for (const track of addToQueue) {
            this.queue.unshift(track);
        }
    }

    public async clear(): Promise<void> {
        if (!this.audio) return;

        this.queue = [];
        this.history = [];
    }
}

export namespace AudioPlayer {
    export const context = new Context<AudioPlayer>('audio-player');

    export type Status = 'playing'|'stopped'|'buffering'|'error';
    export type Repeat = 'none'|'one'|'all';
    export type Track = RawTrack;

    export function getRealDuration(audio: HTMLAudioElement, track?: Track|null): number {
        if (audio && Number.isFinite(audio.duration)) {
            return audio.duration;
        }

        if (track?.duration && Number.isFinite(track.duration)) {
            return track.duration;
        }

        return 0;
    }
}
