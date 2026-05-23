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
    import { resource } from 'runed';
    import { resolve } from '$app/paths';
    import type { GETResponse as FeedResponse } from '../api/feed/+server';
    import PostCard from '$lib/components/shared/app/post/PostCard.svelte';

    const session = auth.useSession();
    const posts = resource(
        [],
        async () => {
            const res = await fetch(resolve('/(app)/api/feed'));

            if (!res.ok) {
                throw new Error('Failed to fetch posts');
            }

            return res.json() as Promise<FeedResponse>;
        }
    );
</script>

<div class="flex gap-4 px-5 justify-center">
    <aside class="w-full h-fit max-w-xs hidden xl:grid gap-4">
        <h2 class="text-lg font-semibold">Trending</h2>
        <p>Some trending content...</p>
    </aside>
    <section class="w-full min-h-[200vh] max-w-2xl flex flex-col gap-4 pb-5">
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
        {#each posts.current as post (post.id)}
            <PostCard data={post}/>
        {/each}
    </section>
    <aside class="w-full h-fit max-w-xs hidden md:grid gap-4">
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
