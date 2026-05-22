<script lang="ts">
    import { auth } from '$lib/client/auth';
    import { UserRound, UserRoundPlusIcon } from '@lucide/svelte';
    import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
    import { Item, ItemContent, ItemMedia } from '$lib/components/ui/item';
    import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '../../../lib/components/ui/card';
    import { Button } from '../../../lib/components/ui/button';
    import { createAuthRedirect } from '../../../lib/helpers/utils';
    import { page } from '$app/state';
    import TrackItem from '../../../lib/components/shared/app/release/track/TrackItem.svelte';
    import SuggestedArtistsCard from '../../../lib/components/shared/app/home/SuggestedArtistsCard.svelte';

    const session = auth.useSession();
</script>

<div class="flex gap-4 px-5 justify-center">
    <aside class="w-full h-fit max-w-xs hidden xl:grid gap-4">
        <h2 class="text-lg font-semibold">Trending</h2>
        <p>Some trending content...</p>
    </aside>
    <section class="w-full h-[200vh] max-w-3xl">
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
                <Button
                    variant="outline"
                    class="h-10 rounded-full justify-start text-left w-full text-sm text-muted-foreground font-normal cursor-text"
                    href={!$session.data?.user ?  createAuthRedirect('signin', page.url) : undefined}
                >
                    What's on your mind{$session.data?.user?.name ? `, ${$session?.data.user?.name}` : ''}?
                </Button>
            </ItemContent>
        </Item>
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
            <SuggestedArtistsCard/>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Suggested Tracks
                    </CardTitle>
                    <CardDescription>
                        Discover music
                    </CardDescription>
                    <CardAction>
                        <Button variant="outline" size="sm">
                            Refresh
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent class="grid gap-2">
                    {#each { length: 5 }}
                        <TrackItem
                            cover
                            class="p-0 bg-transparent!"
                            track={{
                                id: '1',
                                name: 'Sample Track',
                                duration: 240,
                                cover: null,
                                releaseId: '1',
                                file: 'e',
                                explicit: false,
                                position: 1,
                                lyricsId: null,
                                metadata: {},
                                createdAt: new Date(),
                                updatedAt: new Date()
                            }}
                        />
                    {/each}
                </CardContent>
            </Card>
            <footer class="text-sm text-muted-foreground text-center mt-4">
                <p>&copy; {new Date().getFullYear()} Groovy. All rights reserved.</p>
            </footer>
        {/if}
    </aside>
</div>
