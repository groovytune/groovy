<script lang="ts">
    import { resolve } from '$app/paths';
    import { resource } from 'runed';
    import { auth } from '$lib/client/auth';
    import { goto } from '$app/navigation';
    import { createAuthRedirect } from '../../../../helpers/utils';
    import Button, { type ButtonProps } from '../../../ui/button/button.svelte';
    import type { Snippet } from 'svelte';
    import { page } from '$app/state';

    let {
        userId,
        ref = $bindable(null),
        onupdate,
        children,
        ...props
    }: {
        userId: string;
        onupdate?: (following: boolean) => void;
        children?: Snippet<[data: { following: boolean; loading: boolean; }]>;
    } & Omit<ButtonProps, 'children'> = $props();

    const session = auth.useSession();
    const following = resource(
        () => userId,
        async (userId) => {
            const response = await fetch(resolve('/(app)/api/artist/[artistId]/follow', { artistId: userId }));

            if (!response.ok) {
                throw new Error('Failed to fetch follow status');
            }

            const data = await response.json();
            return data.following;
        },
        {
            initialValue: null
        }
    );

    let isLoading = $state(false);

    async function toggleFollow() {
        if (!$session.data?.user) {
            // eslint-disable-next-line svelte/no-navigation-without-resolve
            await goto(createAuthRedirect('signin', page.url));
            return;
        }

        isLoading = true;

        const response = fetch(
            resolve('/(app)/api/artist/[artistId]/follow', { artistId: userId }),
            {
                method: following.current ? 'DELETE' : 'POST'
            }
        );


        following.mutate(!following.current);
        isLoading = false;

        const res = await response;

        if (!res.ok) {
            following.mutate(!following.current);
            throw new Error('Failed to toggle follow status');
        }

        onupdate?.(following.current);
    }
</script>

<Button
    bind:ref
    {...props}
    href={!$session.data?.user ? createAuthRedirect('signin', page.url) : undefined}
    onclick={isLoading || following.current === null ? undefined : toggleFollow}
>
    {#if children}
        {@render children?.({ following: following.current, loading: isLoading })}
    {:else}
        {#if following.current}
            Unfollow
        {:else}
            Follow
        {/if}
    {/if}
</Button>
