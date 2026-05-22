<script lang="ts">
    import { goto } from '$app/navigation';
    import { auth } from '$lib/client/auth';
    import { LikedCache } from '$lib/helpers/classes/LikedCache.svelte';
    import { type Snippet } from 'svelte';
    import { createAuthRedirect } from '$lib/helpers/utils';
    import Button, { type ButtonProps } from '$lib/components/ui/button/button.svelte';
    import { HeartIcon } from '@lucide/svelte';

    let {
        itemId,
        itemType,
        optimistic = true,
        ref = $bindable(null),
        children,
        child,
        onupdate,
        ...props
    }: {
        itemId: string;
        itemType: LikedCache.PendingState['type'];
        optimistic?: boolean;
        children?: Snippet<[{ liked: boolean|undefined }]>;
        child?: Snippet<[{ liked: boolean|undefined; toggleLike: () => Promise<void>; props: ButtonProps; }]>;
        onupdate?: (liked: boolean) => void;
    } & Omit<ButtonProps, 'children'> = $props();

    const likedCache = LikedCache.context.get();
    const session = auth.useSession();

    let liked = $derived(likedCache.tracks.get(itemId));

    $effect(() => {
        if (!$session.data?.user) return;

        likedCache.fetchLikeStatus({
            id: itemId,
            type: itemType
        });
    });

    async function toggleLike() {
        if (!$session.data?.user) {
            // eslint-disable-next-line svelte/no-navigation-without-resolve
            await goto(createAuthRedirect('signin', location.href));
            return;
        }

        const updated = await likedCache.updateLikeStatus({
            id: itemId,
            type: itemType,
            status: 'toggle',
            optimistic
        });

        onupdate?.(updated);
    }
</script>

{#if child}
    {@render child?.({
        liked,
        toggleLike,
        props
    })}
{:else}
    <Button
        bind:ref
        size="icon"
        variant={liked ? "default" : "outline"}
        {...props}
        onclick={toggleLike}
    >
        {#if children}
            {@render children?.({ liked })}
        {:else}
            <HeartIcon class={[liked && "fill-current"]}/>
        {/if}
    </Button>
{/if}
