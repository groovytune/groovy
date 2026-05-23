<script lang="ts">
    import { EllipsisIcon, ForwardIcon, HeartIcon, MessageCircle } from '@lucide/svelte';
    import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Button } from '$lib/components/ui/button';
    import { numberFormatter } from '$lib/helpers/constants';
    import type { GETResponse as PostItemData } from '../../../../../routes/(app)/api/feed/+server';
    import { createUserProfileURL } from '../../../../helpers/utils';
    import { DateTime } from 'luxon';
    import { auth } from '../../../../client/auth';
    import FollowButton from '../artist/FollowButton.svelte';
    import LikeButton from '../LikeButton.svelte';
    import { resolve } from '$app/paths';
    import { Appwrite } from '../../../../client/appwrite';
    import PostMediaGrid from './PostMediaGrid.svelte';

    let {
        data
    }: {
        data: PostItemData[0];
    } = $props();

    const session = auth.useSession();

    let likes = $derived(data._count.likes);
    let replies = $derived(data._count.replies);
    let user = $derived(data.user);

    async function getMediaFiles(ids: string[]): Promise<{ type: 'image'|'video'; url: string; }[]> {
        const files: { type: 'image'|'video'; url: string; }[] = [];

        for (const id of ids) {
            const data = await Appwrite.storage.getFile({
                bucketId: 'media',
                fileId: id
            }).catch(() => null);

            if (!data) continue;

            const url = Appwrite.storage.getFileView({
                bucketId: 'media',
                fileId: id
            });

            files.push({
                type: data.mimeType.startsWith('video') ? 'video' : 'image',
                url
            });
        }

        return files;
    }
</script>

<Card class="py-4 gap-2">
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
                {DateTime.fromISO(String(data.createdAt)).toRelative()}
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
        <a
            href={resolve('/(app)/post/[postId]', { postId: data.id })}
            class="grid gap-2"
        >
            <p class="text-balance line-clamp-3 leading-relaxed">
                {data.content}
            </p>
            {#await getMediaFiles(data.media) then media}
                {#if media.length}
                    <PostMediaGrid {media} class="mb-2"/>
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
        <Button variant="outline" size="sm">
            <ForwardIcon/>
            Share
        </Button>
    </CardFooter>
</Card>
