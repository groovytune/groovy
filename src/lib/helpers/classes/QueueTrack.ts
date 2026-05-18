import { decodeTime, ulid } from 'ulid';
import type { AudioPlayer } from './AudioPlayer.svelte';

export class QueueTrack {
    public id: string;
    public sortId: string;
    public track: AudioPlayer.Track;

    get addedAt(): number {
        return decodeTime(this.id);
    }

    constructor(track: AudioPlayer.Track, sortId?: string|number) {
        this.track = track;
        this.id = ulid();
        this.sortId = typeof sortId === 'string' ? sortId : ulid(sortId);
    }

    public regenerateSortId(seed?: number): this {
        this.sortId = ulid(seed);
        return this;
    }
}
