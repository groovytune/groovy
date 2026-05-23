<script lang="ts">
    import { CornerUpRightIcon, EllipsisIcon, ForwardIcon, HeartIcon, MessageCircle } from '@lucide/svelte';
    import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Button } from '$lib/components/ui/button';
    import { numberFormatter } from '$lib/helpers/constants';
    import type { GETResponse as PostItemData } from '../../../../../routes/(app)/api/feed/+server';
    import { createUserProfileURL, getPostMediaFiles } from '$lib/helpers/utils';
    import { DateTime } from 'luxon';
    import { auth } from '$lib/client/auth';
    import FollowButton from '../artist/FollowButton.svelte';
    import LikeButton from '../LikeButton.svelte';
    import { resolve } from '$app/paths';
    import PostMediaGrid from './PostMediaGrid.svelte';
    import { Item, ItemContent, ItemMedia, ItemTitle } from '$lib/components/ui/item';
    import type { ClassValue } from 'clsx';
    import ShareButton from '../release/ShareButton.svelte';
    import { page } from '$app/state';

    let {
        data,
        class: className
    }: {
        data: Omit<PostItemData[0], 'reference'> & {
            reference?: Pick<PostItemData[0], 'reference'>['reference'];
        };
        class?: ClassValue;
    } = $props();

    const session = auth.useSession();

    let likes = $derived(data._count.likes);
    let replies = $derived(data._count.replies);
    let user = $derived(data.user);
</script>

<Card class={["py-4 gap-2", className]}>
    <CardHeader class="flex gap-2 px-4">
        <a href={createUserProfileURL(user)}>
            <Avatar class="size-9">
                <AvatarImage src={user.image}/>
                <AvatarFallback>
                    {user.name.charAt(0).toLowerCase()}
                </AvatarFallback>
            </Avatar>
        </a>
        <a href={createUserProfileURL(user)} class="flex flex-col w-full truncate">
            <CardTitle class="text-sm font-medium text-balance line-clamp-2">
                {user.name}
            </CardTitle>
            <CardDescription class="text-xs text-muted-foreground text-balance line-clamp-1">
                {#if user.username}
                    @{user.username} &middot;
                {/if}
                {DateTime.fromJSDate(new Date(data.createdAt)).toRelative()}
            </CardDescription>
        </a>
        <div class="flex gap-2 w-fit">
            {#if data.userId !== $session.data?.user?.id}
                <FollowButton userId={data.userId} size="sm" class="ml-auto hidden sm:inline-flex"/>
            {/if}
            <Button variant="outline" size="icon-sm" class="ml-auto">
                <EllipsisIcon/>
            </Button>
        </div>
    </CardHeader>
    <CardContent class="px-4 mt-2">
        {#if data.reference}
            <Item size="sm" variant="outline" class="p-1 mb-1">
                {#snippet child({ props })}
                    <a href={resolve('/(app)/post/[postId]', { postId: data.reference!.id })} {...props}>
                        <ItemMedia variant="icon" class="p-2!">
                            <CornerUpRightIcon/>
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle class="text-sm block">
                                Replied to <span class="text-primary">{data.reference!.user.name}</span>
                            </ItemTitle>
                        </ItemContent>
                    </a>
                {/snippet}
            </Item>
        {/if}
        <a
            href={resolve('/(app)/post/[postId]', { postId: data.id })}
            class="flex flex-col gap-2"
        >
            <p class="line-clamp-3 leading-relaxed whitespace-break-spaces" style="word-wrap: break-word;">
                {data.content}
            </p>
            {#await getPostMediaFiles(data.media) then media}
                {#if media.length}
                    <PostMediaGrid {media} preview disabled class="mb-2"/>
                {/if}
            {/await}
        </a>
    </CardContent>
    <CardFooter class="px-4 flex gap-2">
        <LikeButton
            itemId={data.id}
            itemType="post"
            size="sm"
        >
            {#snippet child({ props, liked, toggleLike })}
                <Button
                    {...props}
                    size="sm"
                    variant="outline"
                    class={[
                        liked && "text-primary!"
                    ]}
                    onclick={async () => {
                        likes = liked ? likes - 1 : likes + 1;

                        await toggleLike()
                            .catch(() => {
                                likes = liked ? likes + 1 : likes - 1;
                            });
                    }}
                >
                    <HeartIcon class={[liked && "fill-current"]}/>
                    {likes ? numberFormatter.format(likes) : 'Like'}
                </Button>
            {/snippet}
        </LikeButton>
        <Button variant="outline" size="sm">
            <MessageCircle/>
            {replies ? numberFormatter.format(replies) : 'Reply'}
        </Button>
        <ShareButton
            data={{
                title: `A post by ${user.name} on Groovy`,
                url: new URL(resolve('/(app)/post/[postId]', { postId: data.id }), page.url.origin).href
            }}
        >
            {#snippet child({ onclick })}
                <Button variant="outline" size="sm" {onclick}>
                    <ForwardIcon/>
                    Share
                </Button>
            {/snippet}
    </ShareButton>
    </CardFooter>
</Card>
