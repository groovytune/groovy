import { SvelteMap } from 'svelte/reactivity';
import type { Release } from '$lib/server/prisma/browser';
import { resolve } from '$app/paths';
import { Context } from 'runed';
import type { PartialUser } from '../utils';

export class ReleaseInfoCache {
    public releases: SvelteMap<string, Release> = new SvelteMap();
    public artists: SvelteMap<string, PartialUser> = new SvelteMap();

    public async fetchReleaseInfo(options: ReleaseInfoCache.FetchOptions): Promise<Release|null> {
        if (this.releases.has(options.releaseId) && !options.force) {
            const cached = this.releases.get(options.releaseId);

            if (cached) {
                return cached;
            }
        }

        const req = options.fetch || fetch;

        const release: Release = await req(resolve(
            '/(app)/api/release/[id]',
            { id: options?.releaseId }
        )).then(res => {
            if (!res.ok) {
                throw new Error(`Failed to fetch release info: ${res.status} ${res.statusText}`);
            }

            return res.json();
        });

        this.releases.set(options.releaseId, release);
        return release;
    }

    public async fetchReleaseArtistInfo(options: ReleaseInfoCache.FetchOptions): Promise<PartialUser|null> {
        if (this.artists.has(options.releaseId) && !options.force) {
            const cached = this.artists.get(options.releaseId);

            if (cached) {
                return cached;
            }
        }

        const artist: PartialUser = await (options.fetch || fetch)(resolve(
            '/(app)/api/release/[id]/artist',
            { id: options.releaseId }
        )).then(res => {
            if (!res.ok) {
                throw new Error(`Failed to fetch artist info: ${res.status} ${res.statusText}`);
            }

            return res.json();
        });

        this.artists.set(options.releaseId, artist);
        return artist;
    }

    public clear() {
        this.releases.clear();
        this.artists.clear();
    }
}

export namespace ReleaseInfoCache {
    export const context = new Context<ReleaseInfoCache>('release-info-cache');

    export interface FetchOptions {
        releaseId: string;
        force?: boolean;
        fetch?: typeof fetch;
    }
}
