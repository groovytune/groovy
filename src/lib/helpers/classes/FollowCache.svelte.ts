import { resolve } from '$app/paths';
import { Context } from 'runed';
import { SvelteMap } from 'svelte/reactivity';

export class FollowCache {
    public following: SvelteMap<string, boolean> = new SvelteMap();
    public followers: SvelteMap<string, boolean> = new SvelteMap();

    public pending: FollowCache.PendingState[] = $state([]);

    public async fetchStatus(options: FollowCache.FetchOptions & { userId: string; type: FollowCache.PendingState['type']; }): Promise<boolean> {
        if (!options.force) switch (options.type) {
            case 'following':
                if (this.following.has(options.userId)) {
                    return this.following.get(options.userId)!;
                }
                break;
            case 'follower':
                if (this.followers.has(options.userId)) {
                    return this.followers.get(options.userId)!;
                }
                break;
        }

        const pending = this.pending.find(p => p.userId === options.userId && p.type === options.type);

        if (pending) {
            return pending.promise;
        }

        const req = options.fetch || fetch;
        const endpoint = options.type === 'following'
            ? resolve('/(app)/api/artist/[artistId]/follow', { artistId: options.userId })
            : resolve('/(app)/api/artist/[artistId]/follower', { artistId: options.userId });

        const promise = req(endpoint)
            .then(async res => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch follow status: ${res.statusText}`);
                }

                const data = await res.json() as { follower: boolean; following: boolean; };

                switch (options.type) {
                    case 'following':
                        this.following.set(options.userId, data.following);
                        return data.following;
                    case 'follower':
                        this.followers.set(options.userId, data.follower);
                        return data.follower;
                }
            })
            .finally(() => {
                this.pending = this.pending.filter(p => p.userId !== options.userId && p.type !== options.type);
            });

        this.pending.push({ userId: options.userId, type: options.type, promise });

        return promise;
    }

    public async updateFollowingStatus(
        options: Omit<FollowCache.FetchOptions, 'force'> & {
            userId: string;
            status: boolean|'toggle';
            optimistic?: boolean;
        }
    ): Promise<boolean> {
        const status: boolean = typeof options.status === 'boolean'
            ? options.status
            : !(await this.fetchStatus({
                userId: options.userId,
                type: 'following',
                fetch: options.fetch
            }));

        const cached = this.following.get(options.userId);
        const optimistic = options.optimistic ?? true;

        if (optimistic) {
            this._setCachedValue('following', options.userId, status);
        }

        const req = options?.fetch || fetch;
        const response = await req(
            resolve('/(app)/api/artist/[artistId]/follow', { artistId: options.userId }),
            {
                method: status ? 'POST' : 'DELETE'
            }
        );

        if (!response.ok) {
            if (optimistic) {
                this._setCachedValue('following', options.userId, cached ?? !status);
            }

            throw new Error(`Failed to update follow status: ${response.statusText}`);
        }

        if (!optimistic) {
            this._setCachedValue('following', options.userId, status);
        }

        return status;
    }

    public async removeFollower(
        options: Omit<FollowCache.FetchOptions, 'force'> & {
            userId: string;
            optimistic?: boolean;
        }
    ): Promise<boolean> {
        const cached = this.followers.get(options.userId);
        const optimistic = options.optimistic ?? true;

        if (optimistic) {
            this._setCachedValue('follower', options.userId, false);
        }

        const req = options?.fetch || fetch;
        const response = await req(
            resolve('/(app)/api/artist/[artistId]/follower', { artistId: options.userId }),
            { method: 'DELETE' }
        );

        if (!response.ok) {
            if (optimistic) {
                this._setCachedValue('follower', options.userId, cached ?? true);
            }

            throw new Error(`Failed to remove follower: ${response.statusText}`);
        }

        if (!optimistic) {
            this._setCachedValue('follower', options.userId, false);
        }

        return false;
    }

    private _setCachedValue(type: FollowCache.PendingState['type'], id: string, status: boolean) {
        switch (type) {
            case 'following':
                this.following.set(id, status);
                break;
            case 'follower':
                this.followers.set(id, status);
                break;
        }
    }
}

export namespace FollowCache {
    export const context = new Context<FollowCache>('follow-cache');

    export interface PendingFollowerState { userId: string; type: 'follower'; promise: Promise<boolean> };
    export interface PendingFollowingState { userId: string; type: 'following'; promise: Promise<boolean> };
    export type PendingState = PendingFollowerState | PendingFollowingState;


    export interface FetchOptions {
        force?: boolean;
        fetch?: typeof fetch;
    }
}
