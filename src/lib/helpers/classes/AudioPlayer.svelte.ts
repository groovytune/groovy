import type { Track } from '$lib/server/prisma/browser';
import { useEventListener } from 'runed';
import { Appwrite } from '$lib/client/appwrite';

export class AudioPlayer {
    public audio: HTMLAudioElement|null = $state(null);

    public queue: Track[] = $state([]);
    public history: Track[] = $state([]);
    public currentTrack: Track|null = $state(null);

    public repeat: AudioPlayer.Repeat = $state('none');

    public status: AudioPlayer.Status = $state('stopped');
    public paused: boolean = $state(true);
    public volume: number = $state(1);
    public duration: number = $state(0);
    public currentTime: number = $state(0);

    public skippable: boolean = $derived(!!this.queue.length && !!this.audio);
    public previousable: boolean = $derived(!!this.history.length && !!this.audio);

    public progress: number = $derived(
        this.audio && this.currentTrack
            ? (this.currentTime / this.duration) * 100
            : 0
    );

    public async init(audio?: HTMLAudioElement): Promise<void> {
        this.audio = audio ?? new Audio();

        useEventListener(() => this.audio, 'timeupdate', () => this.currentTime = this.audio!.currentTime);
        useEventListener(() => this.audio, ['pause', 'play'], () => this.paused = this.audio!.paused);
        useEventListener(() => this.audio, 'volumechange', () => this.volume = this.audio!.volume);
        useEventListener(() => this.audio, ['play', 'playing'], () => this.status = 'playing');

        useEventListener(
            () => this.audio,
            'durationchange',
            () => this.duration = AudioPlayer.getRealDuration(this.audio!, this.currentTrack)
        );

        useEventListener(
            () => this.audio,
            ['ended', 'abort', 'error'],
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
    }

    public destroy(): void {
        this.audio?.pause();
        this.audio?.removeAttribute('src');
        this.audio?.remove();

        this.audio = null;
        this.queue = [];
        this.history = [];
        this.currentTrack = null;
    }

    public add(track: Track, next: boolean = false): void {
        if (next) {
            this.queue.unshift(track);
        } else {
            this.queue.push(track);
        }
    }

    public remove(track: Track|string|number, from: 'queue' | 'history' = 'queue'): void {
        const list = from === 'queue' ? this.queue : this.history;
        const index = typeof track === 'object' ? list.findIndex(t => t.id === track.id) : list.findIndex(t => t.id === track);

        if (index !== -1) {
            list.splice(index, 1);
        }
    }

    public async replaceQueue(tracks: Track[]): Promise<void> {
        this.clear();
        this.queue = tracks;

        const nextTrack = this.queue.shift();

        if (this.currentTrack) {
            this.history.unshift(this.currentTrack);
            this.currentTrack = nextTrack ?? null;
        }

        if (nextTrack) {
            await this.loadCurrentTrack(nextTrack);
        }
    }

    public async replaceCurrentTrack(track: Track, moveHistory: boolean = true): Promise<void> {
        if (!this.audio) return;

        if (this.currentTrack && moveHistory) {
            this.history.unshift(this.currentTrack);
        }

        await this.loadCurrentTrack(track);
    }

    public async loadCurrentTrack(track: Track): Promise<void> {
        if (!this.audio) return;

        this.currentTrack = track;

        const source = Appwrite.storage.getFileView({ bucketId: 'audio', fileId: track.file });

        this.audio.pause();
        this.audio.src = source;
        this.audio.currentTime = 0;
        this.audio.load();

        console.log('Loaded track:', source, this.audio);
    }

    public stop(): void {
        if (!this.audio) return;

        if (this.currentTrack) {
            this.history.unshift(this.currentTrack);
            this.currentTrack = null;
        }

        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.removeAttribute('src');

        this.status = 'stopped';
    }

    public async play(track?: Track): Promise<void> {
        if (!this.audio) return;

        if (this.currentTrack) {
            if (track) {
                this.add(track);
            }

            await this.audio.play();
            return;
        }

        track ??= this.queue.shift();
        if (!track) return;

        await this.loadCurrentTrack(track);
        await this.audio.play();
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

    public async seek(time: number): Promise<void> {
        if (!this.audio || !this.currentTrack) return;

        this.audio.currentTime = time;
    }

    public async setVolume(volume: number): Promise<void> {
        if (!this.audio) return;

        this.audio.volume = volume;
    }

    public async next(index: number = 0): Promise<void> {
        if (!this.audio) return;

        const addToHistory = this.queue.splice(0, index);
        const nextTrack = this.queue.shift();

        if (this.currentTrack) {
            this.history.unshift(this.currentTrack);
            this.currentTrack = nextTrack ?? null;
        }

        if (nextTrack) {
            await this.loadCurrentTrack(nextTrack);
            await this.audio.play();
        }

        for (const track of addToHistory) {
            this.history.unshift(track);
        }
    }

    public async previous(index: number = 0): Promise<void> {
        if (!this.audio) return;

        const addToQueue = this.history.splice(0, index);
        const previousTrack = this.history.shift();

        if (this.currentTrack) {
            this.queue.unshift(this.currentTrack);
            this.currentTrack = previousTrack ?? null;
        }

        if (previousTrack) {
            await this.loadCurrentTrack(previousTrack);
            await this.audio.play();
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
    export type Status = 'playing'|'stopped'|'buffering'|'error';
    export type Repeat = 'none'|'one'|'all';

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
