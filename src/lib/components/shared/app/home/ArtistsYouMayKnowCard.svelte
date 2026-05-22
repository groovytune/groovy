<script lang="ts">
    import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '$lib/components/ui/item';
    import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
    import { Button } from '$lib/components/ui/button';
    import { LoaderCircleIcon, UserRound, UsersRoundIcon } from '@lucide/svelte';
    import { resource } from 'runed';
    import { resolve } from '$app/paths';
    import type { GETResponse } from '../../../../../routes/(app)/api/suggestions/artists/+server';
    import { numberFormatter } from '$lib/helpers/constants';
    import FollowButton from '../artist/FollowButton.svelte';
    import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../ui/empty';

    const artists = resource(
        [],
        async () => {
            const res = await fetch(resolve('/(app)/api/suggestions/artists'))
            return await res.json() as GETResponse;
        }
    )
</script>

<Card>
    <CardHeader>
        <CardTitle>
            Artists You May Know
        </CardTitle>
        <CardDescription>
            Based on your followed artists
        </CardDescription>
        <CardAction>
            <Button variant="outline" size="sm" disabled={artists.loading} onclick={() => artists.refetch()}>
                Refresh
            </Button>
        </CardAction>
    </CardHeader>
    <CardContent class="grid gap-2">
        {#if artists.loading || artists.error || !artists.current?.length}
            <Empty>
                <EmptyHeader class="gap-0">
                    <EmptyMedia variant="icon">
                        {#if artists.loading}
                            <LoaderCircleIcon class="size-6 animate-spin"/>
                        {:else}
                            <UsersRoundIcon class="size-6"/>
                        {/if}
                    </EmptyMedia>
                    <EmptyTitle>
                        {artists.loading ? 'Loading artists' : artists.error ? 'Failed to load' : 'No suggestions'}
                    </EmptyTitle>
                    <EmptyDescription>
                        {artists.error ? 'Please try again later.' : 'You\'re all caught up!'}
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
         {:else}
            {#each artists.current as artist (artist.id)}
                {@const artistURL = resolve('/(app)/artist/[userResolvable]', { userResolvable: artist.username ? `@${artist.username}` : artist.id })}
                <Item size="sm" class="p-0">
                    <ItemMedia>
                        <Avatar class="size-10">
                            <AvatarImage src={artist.image}/>
                            <AvatarFallback>
                                <UserRound class="size-4"/>
                            </AvatarFallback>
                        </Avatar>
                    </ItemMedia>
                    <ItemContent class="gap-0">
                        <ItemTitle class="text-sm font-medium line-clamp-1">
                            <a href={artistURL}>
                                {artist.name}
                            </a>
                        </ItemTitle>
                        <ItemDescription class="text-xs text-muted-foreground">
                            {numberFormatter.format(artist._count.followers)} follower{artist._count.followers !== 1 ? 's' : ''}
                        </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <FollowButton
                            userId={artist.id}
                            onupdate={following => artist._count.followers += following ? 1 : -1}
                            size="sm"
                            variant="secondary"
                        >
                        </FollowButton>
                    </ItemActions>
                </Item>
            {/each}
        {/if}
    </CardContent>
</Card>
