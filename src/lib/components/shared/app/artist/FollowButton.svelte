<script lang="ts">
    import { auth } from '$lib/client/auth';
    import { goto } from '$app/navigation';
    import { createAuthRedirect } from '$lib/helpers/utils';
    import Button, { type ButtonProps } from '$lib/components/ui/button/button.svelte';
    import type { Snippet } from 'svelte';
    import { page } from '$app/state';
    import { FollowCache } from '$lib/helpers/classes/FollowCache.svelte';
    import { LoaderCircleIcon } from '@lucide/svelte';

    let {
        userId,
        optimistic = true,
        ref = $bindable(null),
        onupdate,
        children,
        ...props
    }: {
        userId: string;
        optimistic?: boolean;
        onupdate?: (following: boolean) => void;
        children?: Snippet<[data: { following: boolean; loading: boolean; }]>;
    } & Omit<ButtonProps, 'children'> = $props();

    const followCache = FollowCache.context.get();
    const session = auth.useSession();

    let following = $derived(followCache.following.get(userId));
    let isLoading = $derived(!optimistic && followCache.pending.some(p => p.userId === userId && p.type === 'following'));

    $effect(() => {
        if (!$session.data?.user) return;

        followCache.fetchStatus({ userId, type: 'following' });
    });

    async function toggleFollow() {
        if (!$session.data?.user) {
            // eslint-disable-next-line svelte/no-navigation-without-resolve
            await goto(createAuthRedirect('signin', page.url));
            return;
        }

        const following = await followCache.updateFollowingStatus({
            userId,
            status: 'toggle',
            optimistic
        });

        onupdate?.(following);
    }
</script>

<Button
    bind:ref
    variant={following ? 'outline' : 'default'}
    {...props}
    href={!$session.data?.user ? createAuthRedirect('signin', page.url) : undefined}
    onclick={isLoading || following !== undefined ? toggleFollow : undefined}
>
    {#if children}
        {@render children?.({ following: !!following, loading: isLoading })}
    {:else}
        {#if isLoading}
            <LoaderCircleIcon class="animate-spin"/>
        {:else if following}
            Unfollow
        {:else}
            Follow
        {/if}
    {/if}
</Button>
