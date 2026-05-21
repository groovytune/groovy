import { SvelteMap } from 'svelte/reactivity';
import { resolve } from '$app/paths';
import { Context } from 'runed';

export class LikedCache {
    public tracks = new SvelteMap<string, boolean>();
    public releases = new SvelteMap<string, boolean>();

    public pending: LikedCache.PendingState[] = $state([]);

    public async fetchTrackLike(trackId: string, options?: LikedCache.FetchOptions): Promise<boolean> {
        if (this.tracks.has(trackId) && !options?.force) {
            return this.tracks.get(trackId) ?? false;
        }

        const pending = this.pending.find(p => p.id === trackId && p.type === 'track');

        if (pending?.type === 'track') {
            return pending.promise;
        }

        const req = options?.fetch || fetch;
        const track: Promise<boolean> = req(resolve(
            '/(app)/api/track/[trackId]/like',
            { trackId }
        ))
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch like status');
                }

                return res.json() as Promise<LikedCache.Response>;
            })
            .then(data => data.liked)
            .finally(() => {
                this.pending = this.pending.filter(p => !(p.id === trackId && p.type === 'track'));
            });

        this.pending.push({ id: trackId, type: 'track', promise: track });
        this.tracks.set(trackId, await track);

        return track;
    }

    public async fetchReleaseLike(releaseId: string, options?: LikedCache.FetchOptions): Promise<boolean> {
        if (this.releases.has(releaseId) && !options?.force) {
            return this.releases.get(releaseId) ?? false;
        }

        const pending = this.pending.find(p => p.id === releaseId && p.type === 'release');

        if (pending?.type === 'release') {
            return pending.promise;
        }

        const req = options?.fetch || fetch;
        const release: Promise<boolean> = req(resolve(
            '/(app)/api/release/[releaseId]/like',
            { releaseId }
        ))
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch like status');
                }

                return res.json() as Promise<LikedCache.Response>;
            })
            .then(data => data.liked)
            .finally(() => {
                this.pending = this.pending.filter(p => !(p.id === releaseId && p.type === 'release'));
            });

        this.pending.push({ id: releaseId, type: 'release', promise: release });
        this.releases.set(releaseId, await release);

        return release;
    }

    public async updateTrackLike(trackId: string, liked: boolean, options?: Omit<LikedCache.FetchOptions, 'force'>): Promise<boolean> {
        const cached = this.tracks.get(trackId);

        this.tracks.set(trackId, liked);

        const req = options?.fetch || fetch;
        const method = liked ? 'POST' : 'DELETE';

        const response = await req(resolve(
            '/(app)/api/track/[trackId]/like',
            { trackId }
        ), { method });

        if (!response.ok) {
            this.tracks.set(trackId, cached ?? !liked);
            throw new Error('Failed to update like status');
        }

        return liked;
    }

    public async updateReleaseLike(releaseId: string, liked: boolean, options?: Omit<LikedCache.FetchOptions, 'force'>): Promise<boolean> {
        const cached = this.releases.get(releaseId);

        this.releases.set(releaseId, liked);

        const req = options?.fetch || fetch;
        const method = liked ? 'POST' : 'DELETE';

        const response = await req(resolve(
            '/(app)/api/release/[releaseId]/like',
            { releaseId }
        ), { method });

        if (!response.ok) {
            this.releases.set(releaseId, cached ?? !liked);
            throw new Error('Failed to update like status');
        }

        return liked;
    }
}

export namespace LikedCache {
    export const context = new Context<LikedCache>('liked-cache');

    export type PendingTrackState = { id: string; type: 'track'; promise: Promise<boolean>; }
    export type PendingReleaseState = { id: string; type: 'release'; promise: Promise<boolean>; }
    export type Response = { liked: boolean; data: unknown; }

    export type PendingState = PendingTrackState | PendingReleaseState;

    export interface FetchOptions {
        force?: boolean;
        fetch?: typeof fetch;
    }
}
