<script lang="ts">
    import { auth } from '$lib/client/auth';
    import { UserRound, UserRoundPlusIcon } from '@lucide/svelte';
    import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
    import { Item, ItemContent, ItemMedia } from '$lib/components/ui/item';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Button } from '$lib/components/ui/button';
    import { createAuthRedirect } from '$lib/helpers/utils';
    import { page } from '$app/state';
    import ArtistsYouMayKnow from '$lib/components/shared/app/home/ArtistsYouMayKnowCard.svelte';
    import SuggestedTracksCard from '$lib/components/shared/app/home/SuggestedTracksCard.svelte';
    import NewPostButton from '$lib/components/shared/app/post/NewPostButton.svelte';
    import { resolve } from '$app/paths';
    import type { GETResponse as FeedResponse } from '../api/feed/+server';
    import PostCard from '$lib/components/shared/app/post/PostCard.svelte';
    import { onMount } from 'svelte';
    import DiscoverReleasesCard from '$lib/components/shared/app/home/DiscoverReleasesCard.svelte';
    import { Chart } from '../discover/+page.svelte';

    const session = auth.useSession();

    let posts: FeedResponse = $state([]);
    let isLoading = $state(false);
    let isAtEnd = $state(false);

    async function loadPosts() {
        isLoading = true;

        const lastPost = posts.at(-1)?.id;
        const response = await fetch(resolve('/(app)/api/feed') + '?take=3' + (lastPost ? `&after=${lastPost}` : ''))
            .then(res => res.ok
                ? res.json() as Promise<FeedResponse>
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
        isAtEnd = response.length === 0;
    }

    async function handleScroll() {
        const scrollPosition = window.scrollY + window.innerHeight;
        const threshold = document.documentElement.scrollHeight - 100;

        if (scrollPosition >= threshold && !isLoading && !isAtEnd) {
            await loadPosts();
        }
    }

    onMount(() => {
        loadPosts();
    });
</script>

<svelte:window onscroll={handleScroll}/>

<div class="flex gap-4 px-5 justify-center-safe">
    <aside class="w-full h-fit max-w-xs hidden xl:grid gap-4">
        <DiscoverReleasesCard/>
        {@render Chart(
            'Top 100 Tracks',
            'Explore the most popular tracks on Groovy. Discover new music trends and find your next favorite song.',
            resolve('/(app)/discover/chart'),
            'radial-gradient( circle farthest-corner at 10% 20%,  rgba(170,245,248,1) 0%, rgba(248,162,239,0.8) 90% )',
            'black'
        )}
    </aside>
    <section class="w-full md:w-[calc(100%-320px)] max-w-xl flex flex-col gap-4 pb-5">
        <Item variant="outline" size="sm" class="bg-card rounded-xl">
            <ItemMedia>
                <Avatar class="size-9">
                    <AvatarImage src={$session.data?.user?.image}/>
                    <AvatarFallback>
                        <UserRound class="size-4"/>
                    </AvatarFallback>
                </Avatar>
            </ItemMedia>
            <ItemContent>
                <NewPostButton
                    variant="outline"
                    class="h-10 rounded-full justify-start text-left w-full text-sm text-muted-foreground font-normal cursor-text"
                    href={!$session.data?.user ?  createAuthRedirect('signin', page.url) : undefined}
                >
                    What's on your mind{$session.data?.user?.name ? `, ${$session?.data.user?.name}` : ''}?
                </NewPostButton>
            </ItemContent>
        </Item>
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
    </section>
    <aside class="w-full h-fit max-w-xs hidden md:grid gap-4 shrink-0">
        {#if !$session.data?.user}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Welcome to Groovy
                    </CardTitle>
                    <CardDescription>
                        Please log in to release your creativity and connect with others.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button class="w-full" href={createAuthRedirect('signin', page.url)}>
                        <UserRoundPlusIcon/>
                        Sign In
                    </Button>
                </CardContent>
            </Card>
        {:else}
            <ArtistsYouMayKnow/>
            <SuggestedTracksCard/>
            <footer class="text-sm text-muted-foreground text-center mt-2">
                <p>&copy; {new Date().getFullYear()} Groovy. All rights reserved.</p>
            </footer>
        {/if}
    </aside>
</div>
