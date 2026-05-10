import { SvelteMap } from 'svelte/reactivity';
import type { Release } from '$lib/server/prisma/browser';
import { resolve } from '$app/paths';
import { Context } from 'runed';
import type { PartialUser } from '../utils';

export class ReleaseInfoCache {
    public releases: SvelteMap<string, Release> = new SvelteMap();
    public artists: SvelteMap<string, PartialUser> = new SvelteMap();

    public pending: (ReleaseInfoCache.PendingRelease|ReleaseInfoCache.PendingArtist)[] = $state([]);

    public async fetchReleaseInfo(options: ReleaseInfoCache.FetchOptions): Promise<Release|null> {
        if (this.releases.has(options.releaseId) && !options.force) {
            const cached = this.releases.get(options.releaseId);

            if (cached) {
                return cached;
            }
        }

        const pending = this.pending.find(p => p.id === options.releaseId && p.type === 'release');

        if (pending?.type === 'release') {
            return pending.promise;
        }

        const req = options.fetch || fetch;

        const release: Promise<Release> = req(resolve(
            '/(app)/api/release/[releaseId]',
            { releaseId: options?.releaseId }
        )).then(res => {
            if (!res.ok) {
                throw new Error(`Failed to fetch release info: ${res.status} ${res.statusText}`);
            }

            return res.json();
        }).finally(() => {
            this.pending = this.pending.filter(p => !(p.id === options.releaseId && p.type === 'release'));
        });

        this.pending.push({ id: options.releaseId, type: 'release', promise: release });
        this.releases.set(options.releaseId, await release);

        return release;
    }

    public async fetchReleaseArtistInfo(options: ReleaseInfoCache.FetchOptions): Promise<PartialUser|null> {
        if (this.artists.has(options.releaseId) && !options.force) {
            const cached = this.artists.get(options.releaseId);

            if (cached) {
                return cached;
            }
        }

        const pending = this.pending.find(p => p.id === options.releaseId && p.type === 'artist');

        if (pending?.type === 'artist') {
            return pending.promise;
        }

        const artist: Promise<PartialUser> = (options.fetch || fetch)(resolve(
            '/(app)/api/release/[releaseId]/artist',
            { releaseId: options.releaseId }
        )).then(res => {
            if (!res.ok) {
                throw new Error(`Failed to fetch artist info: ${res.status} ${res.statusText}`);
            }

            return res.json();
        }).finally(() => {
            this.pending = this.pending.filter(p => !(p.id === options.releaseId && p.type === 'artist'));
        });

        this.pending.push({ id: options.releaseId, type: 'artist', promise: artist });
        this.artists.set(options.releaseId, await artist);

        return artist;
    }

    public clear() {
        this.releases.clear();
        this.artists.clear();
    }
}

export namespace ReleaseInfoCache {
    export const context = new Context<ReleaseInfoCache>('release-info-cache');

    export interface PendingRelease { id: string; type: 'release'; promise: Promise<Release|null> }
    export interface PendingArtist { id: string; type: 'artist'; promise: Promise<PartialUser|null> }

    export interface FetchOptions {
        releaseId: string;
        force?: boolean;
        fetch?: typeof fetch;
    }
}
