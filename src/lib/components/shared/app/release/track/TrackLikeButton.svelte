<script lang="ts">
    import { goto } from '$app/navigation';
    import { auth } from '$lib/client/auth';
    import { LikedCache } from '$lib/helpers/classes/LikedCache.svelte';
    import { type Snippet } from 'svelte';
    import { createAuthRedirect } from '$lib/helpers/utils';
    import Button, { type ButtonProps } from '$lib/components/ui/button/button.svelte';
    import { HeartIcon } from '@lucide/svelte';

    let {
        trackId,
        ref = $bindable(null),
        children,
        child,
        onupdate,
        ...props
    }: {
        trackId: string;
        children?: Snippet<[{ liked: boolean|undefined }]>;
        child?: Snippet<[{ liked: boolean|undefined; toggleLike: () => Promise<void>; props: ButtonProps; }]>;
        onupdate?: (liked: boolean) => void;
    } & Omit<ButtonProps, 'children'> = $props();

    const likedCache = LikedCache.context.get();
    const session = auth.useSession();

    let liked = $derived(likedCache.tracks.get(trackId));

    $effect(() => {
        if (!$session.data?.user) return;
        likedCache.fetchTrackLike(trackId);
    });

    async function toggleLike() {
        if (!$session.data?.user) {
            // eslint-disable-next-line svelte/no-navigation-without-resolve
            await goto(createAuthRedirect('signin', location.href));
            return;
        }

        const liked = await likedCache.fetchTrackLike(trackId);
        const updated = await likedCache.updateTrackLike(trackId, !liked);

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
