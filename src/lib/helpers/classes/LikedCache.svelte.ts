import { SvelteMap } from 'svelte/reactivity';
import { resolve } from '$app/paths';
import { Context } from 'runed';

export class LikedCache {
    public tracks = new SvelteMap<string, boolean>();
    public releases = new SvelteMap<string, boolean>();
    public posts = new SvelteMap<string, boolean>();

    public pending: LikedCache.PendingState[] = $state([]);

    public async fetchLikeStatus(options: LikedCache.FetchOptions & { id: string, type: LikedCache.PendingState['type'] }): Promise<boolean> {
        if (!options.force) {
            switch (options.type) {
                case 'track':
                    if (this.tracks.has(options.id)) {
                        return this.tracks.get(options.id) ?? false;
                    }
                    break;
                case 'release':
                    if (this.releases.has(options.id)) {
                        return this.releases.get(options.id) ?? false;
                    }
                    break;
                case 'post':
                    if (this.posts.has(options.id)) {
                        return this.posts.get(options.id) ?? false;
                    }
                    break;
            }
        }

        const pending = this.pending.find(p => p.id === options.id && p.type === options.type);
        const endpoint = LikedCache.getEndpoint(options.type, options.id);

        if (pending) {
            return pending.promise;
        }

        const req = options.fetch || fetch;
        const promise = req(endpoint)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch like status');
                }

                return res.json() as Promise<LikedCache.Response>;
            })
            .then(data => data.liked)
            .finally(() => {
                this.pending = this.pending.filter(p => p.id !== options.id && p.type !== options.type);
            });

        this.pending.push({ id: options.id, type: options.type, promise });

        switch (options.type) {
            case 'track':
                this.tracks.set(options.id, await promise);
                break;
            case 'release':
                this.releases.set(options.id, await promise);
                break;
            case 'post':
                this.posts.set(options.id, await promise);
                break;
        }

        return promise;
    }

    public async updateLikeStatus(
        options: Omit<LikedCache.FetchOptions, 'force'> & {
            id: string;
            type: LikedCache.PendingState['type'];
            status: 'toggle'|boolean;
            optimistic?: boolean;
        }
    ): Promise<boolean> {
        const status: boolean = typeof options.status === 'boolean'
            ? options.status
            : !(await this.fetchLikeStatus({
                id: options.id,
                type: options.type,
                fetch: options.fetch
            }));

        const cached = this.tracks.get(options.id);
        const optimistic = options.optimistic ?? true;

        if (optimistic) {
            this._setCachedValue(options.type, options.id, status);
        }

        const req = options?.fetch || fetch;
        const endpoint = LikedCache.getEndpoint(options.type, options.id);
        const response = await req(endpoint, { method: status ? 'POST' : 'DELETE' });

        if (!response.ok) {
            if (optimistic) {
                this._setCachedValue(options.type, options.id, cached ?? !status);
            }

            throw new Error('Failed to update like status');
        }

        if (!optimistic) {
            this._setCachedValue(options.type, options.id, status);
        }

        return status;
    }

    public clear() {
        this.tracks.clear();
        this.releases.clear();
        this.posts.clear();
        this.pending = [];
    }

    private _setCachedValue(type: LikedCache.PendingState['type'], id: string, liked: boolean) {
        switch (type) {
            case 'track':
                this.tracks.set(id, liked);
                break;
            case 'release':
                this.releases.set(id, liked);
                break;
            case 'post':
                this.posts.set(id, liked);
                break;
        }
    }
}

export namespace LikedCache {
    export const context = new Context<LikedCache>('liked-cache');

    export type PendingTrackState = { id: string; type: 'track'; promise: Promise<boolean>; }
    export type PendingReleaseState = { id: string; type: 'release'; promise: Promise<boolean>; }
    export type PendingPostState = { id: string; type: 'post'; promise: Promise<boolean>; }
    export type Response = { liked: boolean; data: unknown; }

    export type PendingState = PendingTrackState | PendingReleaseState | PendingPostState;

    export interface FetchOptions {
        force?: boolean;
        fetch?: typeof fetch;
    }

    export function getEndpoint(type: PendingState['type'], id: string): string {
        switch (type) {
            case 'track':
                return resolve('/(app)/api/track/[trackId]/like', { trackId: id });
            case 'release':
                return resolve('/(app)/api/release/[releaseId]/like', { releaseId: id });
            case 'post':
                return resolve('/(app)/api/post/[postId]/like', { postId: id });
        }
    }
}
