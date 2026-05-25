import { SvelteMap } from 'svelte/reactivity';
import type { Lyrics } from '$lib/server/prisma/browser';
import { Context } from 'runed';
import { resolve } from '$app/paths';

export class LyricsCache {
    public cache: SvelteMap<string, Lyrics> = new SvelteMap();
    public pending: LyricsCache.PendingState[] = $state([]);

    public async fetchLyrics(trackId: string, options: LyricsCache.FetchOptions = {}): Promise<Lyrics> {
        if (!options.force && this.cache.has(trackId)) {
            return this.cache.get(trackId)!;
        }

        const pending = this.pending.find(p => p.id === trackId);

        if (pending) {
            return pending.promise;
        }

        const req = options.fetch || fetch;

        const promise = req(resolve('/(app)/api/track/[trackId]/lyrics', { trackId }))
            .then(async res => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch lyrics: ${res.statusText}`);
                }

                const data = await res.json() as Lyrics;

                this.cache.set(trackId, data);

                return data;
            })
            .finally(() => {
                this.pending = this.pending.filter(p => p.id !== trackId);
            });

        this.pending.push({ id: trackId, promise });

        return promise;
    }
}

export namespace LyricsCache {
    export const context: Context<LyricsCache> = new Context('lyrics-cache');

    export type PendingState = { id: string; promise: Promise<Lyrics> };

    export interface FetchOptions {
        force?: boolean;
        fetch?: typeof fetch;
    }
}
