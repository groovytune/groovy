<script lang="ts">
    import { resolve } from '$app/paths';
    import { resource } from 'runed';
    import { auth } from '$lib/client/auth';
    import { goto } from '$app/navigation';
    import { createAuthRedirect } from '../../../../helpers/utils';
    import Button, { type ButtonProps } from '../../../ui/button/button.svelte';
    import type { Snippet } from 'svelte';

    let {
        userId,
        ref = $bindable(null),
        children,
        ...props
    }: {
        userId: string;
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
            await goto(createAuthRedirect('signin', location.href));
            return;
        }

        isLoading = true;
        following.mutate(!following.current);

        const response = await fetch(
            resolve('/(app)/api/artist/[artistId]/follow', { artistId: userId }),
            {
                method: following.current ? 'DELETE' : 'POST'
            }
        );

        isLoading = false;

        if (!response.ok) {
            following.mutate(!following.current);
            throw new Error('Failed to toggle follow status');
        }
    }
</script>

<Button
    bind:ref
    {...props}
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
