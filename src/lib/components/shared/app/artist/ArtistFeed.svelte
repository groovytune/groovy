<script lang="ts">
    import type { GETResponse as ArtistFeedResponse } from '../../../../../routes/(app)/api/artist/[artistId]/posts/+server';
    import { resolve } from '$app/paths';
    import { onMount } from 'svelte';
    import PostCard from '../post/PostCard.svelte';
    import { Button } from '../../../ui/button';

    let {
        userId,
        includeReplies = false
    }: {
        userId: string;
        includeReplies?: boolean;
    } = $props();

    let posts: ArtistFeedResponse = $state([]);
    let isLoading = $state(false);
    let isAtEnd = $state(false);

    async function loadPosts() {
        isLoading = true;

        const lastPost = posts.at(-1)?.id;
        const take = 3;

        const response = await fetch(
            resolve('/(app)/api/artist/[artistId]/posts', { artistId: userId }) +
            `?take=${take}${lastPost ? '&after=' + lastPost : ''}${includeReplies ? '&replies=true' : ''}`
        )
            .then(res => res.ok
                ? res.json() as Promise<ArtistFeedResponse>
                : Promise.reject(res)
            )
            .catch(err => {
                console.error('Failed to load posts:', err);
                return null;
            })
            .finally(() => {
                isLoading = false;
            });

        if (!response) return;

        posts.push(...response);
        isAtEnd = response.length === 0 || response.length < take;
    }

    async function handleScroll() {
        const scrollPosition = window.scrollY + window.innerHeight;
        const threshold = document.documentElement.scrollHeight - 100;

        if (scrollPosition >= threshold && !isLoading && !isAtEnd) {
            await loadPosts();
        }
    }

    onMount(() => {
        posts = [];
        isAtEnd = false;

        loadPosts();
    });
</script>

<svelte:window onscroll={handleScroll}/>

<!-- eslint-disable-next-line svelte/require-each-key -->
{#each posts as post}
    <PostCard data={post}/>
{/each}
{#if isLoading}
    <p class="text-center text-sm text-muted-foreground">Loading more posts...</p>
{:else if isAtEnd}
    <p class="text-center text-sm text-muted-foreground">No more posts to show.</p>
{:else}
    <Button
        variant="outline"
        class="w-fit self-center"
        onclick={loadPosts}
    >
        Load More
    </Button>
{/if}
