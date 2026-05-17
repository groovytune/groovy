import { decodeTime, ulid } from 'ulid';
import type { AudioPlayer } from './AudioPlayer.svelte';

export class QueueTrack {
    public id: string;
    public track: AudioPlayer.Track;

    get addedAt(): number {
        return decodeTime(this.id);
    }

    constructor(track: AudioPlayer.Track, id?: string|number) {
        this.track = track;
        this.id = typeof id === 'string' ? id : ulid(id);
    }

    public regenerateId(seed?: number): this {
        this.id = ulid(seed);
        return this;
    }
}
