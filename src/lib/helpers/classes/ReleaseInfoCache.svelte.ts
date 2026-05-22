import { SvelteMap } from 'svelte/reactivity';
import type { Release } from '$lib/server/prisma/browser';
import { resolve } from '$app/paths';
import { Context } from 'runed';
import type { PartialUser } from '../utils';

export class ReleaseInfoCache {
    public releases: SvelteMap<string, Release> = new SvelteMap();
    public artists: SvelteMap<string, PartialUser> = new SvelteMap();

    public pending: ReleaseInfoCache.PendingState[] = $state([]);

    public async fetchInfo<T extends ReleaseInfoCache.PendingState['type']>(options: ReleaseInfoCache.FetchOptions & { type: T }): Promise<ReleaseInfoCache.ResponseType<T>> {
        if (!options.force) switch (options.type) {
            case 'release':
                if (this.releases.has(options.releaseId)) {
                    return this.releases.get(options.releaseId) as ReleaseInfoCache.ResponseType<T>;
                }
                break;
            case 'artist':
                if (this.artists.has(options.releaseId)) {
                    return this.artists.get(options.releaseId) as ReleaseInfoCache.ResponseType<T>;
                }
                break;
        }

        const pending = this.pending.find((p): p is ReleaseInfoCache.PendingStateType<T> => p.id === options.releaseId && p.type === options.type);

        if (pending) {
            return pending.promise as Promise<ReleaseInfoCache.ResponseType<T>>;
        }

        const req = options.fetch || fetch;
        const endpoint = options.type === 'release'
            ? resolve('/(app)/api/release/[releaseId]', { releaseId: options.releaseId })
            : resolve('/(app)/api/release/[releaseId]/artist', { releaseId: options.releaseId });

        const promise = req(endpoint)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch ${options.type} info: ${res.status} ${res.statusText}`);
                }

                return res.json() as Promise<ReleaseInfoCache.ResponseType<T>>;
            })
            .finally(() => {
                this.pending = this.pending.filter(p => p.id !== options.releaseId && p.type !== options.type);
            });

        this.pending.push({ id: options.releaseId, type: options.type, promise } as ReleaseInfoCache.PendingStateType<T>);

        const result = await promise;

        switch (options.type) {
            case 'release':
                this.releases.set(options.releaseId, result as Release);
                break;
            case 'artist':
                this.artists.set(options.releaseId, result as PartialUser);
                break;
        }

        return result;
    }

    public clear() {
        this.releases.clear();
        this.artists.clear();
        this.pending = [];
    }
}

export namespace ReleaseInfoCache {
    export const context = new Context<ReleaseInfoCache>('release-info-cache');

    export interface PendingReleaseState { id: string; type: 'release'; promise: Promise<Release> }
    export interface PendingArtistState { id: string; type: 'artist'; promise: Promise<PartialUser> }
    export type PendingState = PendingReleaseState | PendingArtistState;

    export type PendingStateType<T extends PendingState['type']> = T extends 'release' ? PendingReleaseState : PendingArtistState;
    export type ResponseType<T extends PendingState['type']> = T extends 'release' ? Release : PartialUser;

    export interface FetchOptions {
        releaseId: string;
        force?: boolean;
        fetch?: typeof fetch;
    }
}
