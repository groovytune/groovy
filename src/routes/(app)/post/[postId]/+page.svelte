<script lang="ts">
    import { DateTime } from 'luxon';
    import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
    import { createUserProfileURL, fetchPostURLPreview, getPostMediaFiles } from '$lib/helpers/utils.js';
    import FollowButton from '$lib/components/shared/app/artist/FollowButton.svelte';
    import { auth } from '$lib/client/auth.js';
    import { Button } from '$lib/components/ui/button';
    import { CornerUpRightIcon, EllipsisIcon, ForwardIcon, HeartIcon, MessageCircle } from '@lucide/svelte';
    import PostMediaGrid from '$lib/components/shared/app/post/PostMediaGrid.svelte';
    import { onMount } from 'svelte';
    import LikeButton from '$lib/components/shared/app/LikeButton.svelte';
    import { numberFormatter } from '$lib/helpers/constants.js';
    import PostForm from '$lib/components/shared/app/post/forms/PostForm.svelte';
    import PostFormFields from '$lib/components/shared/app/post/forms/PostFormFields.svelte';
    import { Item, ItemContent, ItemMedia, ItemTitle } from '$lib/components/ui/item';
    import { resolve } from '$app/paths';
    import type { GETResponse as RepliesResponse } from '../../api/post/[postId]/replies/+server.js';
    import PostCard from '$lib/components/shared/app/post/PostCard.svelte';
    import { afterNavigate } from '$app/navigation';
    import ShareButton from '$lib/components/shared/app/release/ShareButton.svelte';
    import { page } from '$app/state';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte.js';
    import { resource } from 'runed';
    import PostItemPreview from '$lib/components/shared/app/post/PostItemPreview.svelte';

    let { data } = $props();

    const session = auth.useSession();
    const audioPlayer = AudioPlayer.context.get();

    let post = $derived(data.post);
    let user = $derived(post.user);
    let media: { type: 'image'|'video'; url: string; }[] = $state([]);
    let likeCount = $derived(post._count.likes);
    let replyCount = $derived(post._count.replies);

    let replyTextarea: HTMLTextAreaElement|null = $state(null);

    let replies: RepliesResponse = $state([]);
    let isLoading = $state(false);
    let isAtEnd = $state(false);

    const itemPreview = resource(
        () => post.content,
        async content => fetchPostURLPreview(
            content,
            {
                fetchReleaseUser: releaseId => audioPlayer.releaseCache.fetchInfo({
                    releaseId,
                    type: 'artist'
                })
            }
        )
    );

    async function loadReplies() {
        isLoading = true;

        const lastPost = replies.at(-1)?.id;
        const response = await fetch(resolve('/(app)/api/post/[postId]/replies', { postId: post.id }) + '?take=3' + (lastPost ? `&after=${lastPost}` : ''))
            .then(res => res.ok
                ? res.json() as Promise<RepliesResponse>
                : Promise.reject(res)
            )
            .catch(err => {
                console.error('Failed to load replies:', err);
                return null;
            })
            .finally(() => {
                isLoading = false;
            });

        if (!response) return;

        replies.push(...response);
        isAtEnd = response.length === 0;
    }

    async function handleScroll() {
        const scrollPosition = window.scrollY + window.innerHeight;
        const threshold = document.documentElement.scrollHeight - 100;

        if (scrollPosition >= threshold && !isLoading && !isAtEnd) {
            await loadReplies();
        }
    }

    onMount(async () => {
        if (post.media.length && !media.length) {
            getPostMediaFiles(post.media)
                .then(files => media = files)
                .catch(err => console.error('Failed to load media files:', err));
        }

        if (!replies.length && !isAtEnd) {
            loadReplies();
        }
    });

    afterNavigate(() => {
        media = [];
        replies = [];
        isAtEnd = false;

        loadReplies();

        if (post.media.length) {
            getPostMediaFiles(post.media)
                .then(files => media = files)
                .catch(err => console.error('Failed to load media files:', err));
        }
    });
</script>

<svelte:window onscroll={handleScroll}/>

<section class="flex flex-col gap-2 items-center sm:px-2 sm:pt-5 pb-5">
    <article class="w-full max-w-2xl py-5 border-y sm:border-x border-x-0 sm:rounded-lg grid gap-5">
        <div class="flex items-center gap-3 px-5">
            <a href={createUserProfileURL(user)}>
                <Avatar class="size-10">
                    <AvatarImage src={user.image}/>
                    <AvatarFallback>
                        {user.name.charAt(0).toLowerCase()}
                    </AvatarFallback>
                </Avatar>
            </a>
            <a href={createUserProfileURL(user)} class="flex flex-col w-full truncate">
                <h3 class="text-lg leading-tight font-medium text-balance line-clamp-2">
                    {user.name}
                </h3>
                <p class="text-sm leading-tight text-muted-foreground text-balance line-clamp-1">
                    {#if user.username}
                        @{user.username} &middot;
                    {/if}
                    {DateTime.fromJSDate(new Date(post.createdAt)).toRelative()}
                </p>
            </a>
            <div class="flex gap-2 w-fit">
                {#if post.userId !== $session.data?.user?.id}
                    <FollowButton userId={post.userId} size="sm" class="ml-auto hidden sm:inline-flex"/>
                {/if}
                <Button variant="outline" size="icon-sm" class="ml-auto">
                    <EllipsisIcon/>
                </Button>
            </div>
        </div>
        <div class="px-5">
            {#if post.reference}
                <Item size="sm" variant="outline" class="p-1 mb-1">
                    {#snippet child({ props })}
                        <a href={resolve('/(app)/post/[postId]', { postId: post.reference!.id })} {...props}>
                            <ItemMedia variant="icon" class="p-2!">
                                <CornerUpRightIcon/>
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle class="text-sm block">
                                    Replied to <span class="text-primary">{post.reference!.user.name}</span>
                                </ItemTitle>
                            </ItemContent>
                        </a>
                    {/snippet}
                </Item>
            {/if}
            <p class="leading-relaxed whitespace-break-spaces" style="word-wrap: break-word;">
                {post.content}
            </p>
            {#if itemPreview.current && !itemPreview.loading}
                <PostItemPreview
                    title={itemPreview.current.title}
                    description={itemPreview.current.description}
                    coverURL={itemPreview.current.image}
                    href={itemPreview.current.url}
                />
            {/if}
            {#if media.length}
                <PostMediaGrid {media} class="mt-4"/>
            {/if}
        </div>
        <div class="px-5 flex gap-2">
            <LikeButton
                itemId={post.id}
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
                            likeCount = liked ? likeCount - 1 : likeCount + 1;

                            await toggleLike()
                                .catch(() => {
                                    likeCount = liked ? likeCount + 1 : likeCount - 1;
                                });
                        }}
                    >
                        <HeartIcon class={[liked && "fill-current"]}/>
                        {likeCount ? numberFormatter.format(likeCount) : 'Like'}
                    </Button>
                {/snippet}
            </LikeButton>
            <Button variant="outline" size="sm" onclick={() => replyTextarea?.focus()}>
                <MessageCircle/>
                Reply
            </Button>
            <ShareButton
                data={{
                    title: `A post by ${user.name} on Groovy`,
                    url: new URL(resolve('/(app)/post/[postId]', { postId: post.id }), page.url.origin).href
                }}
            >
                {#snippet child({ onclick })}
                    <Button variant="outline" size="sm" {onclick}>
                        <ForwardIcon/>
                        Share
                    </Button>
                {/snippet}
        </ShareButton>
        </div>
    </article>
    <PostForm
        data={{
            content: '',
            referenceId: post.id
        }}
        class="w-full max-w-2xl grid gap-2 mt-5 px-5 sm:px-0"
    >
        {#snippet children({ form })}
            <h2 class="text-lg font-semibold">
                <MessageCircle class="inline mr-1 mb-1 text-primary size-5"/>
                {replyCount ? `${numberFormatter.format(replyCount)} Repl${replyCount === 1 ? 'y' : 'ies'}` : 'Reply'}
            </h2>
            <PostFormFields
                {form}
                bind:textarea={replyTextarea}
                placeholder="Write a reply..."
            />
        {/snippet}
    </PostForm>
    {#if replies.length || isLoading}
        <div class="w-full max-w-2xl grid gap-4 pt-2 sm:px-0 px-5" id="replies">
            <!-- eslint-disable-next-line svelte/require-each-key -->
            {#each replies as reply}
                <PostCard data={reply} class="rounded-lg"/>
            {/each}
            {#if isLoading || isAtEnd}
                <p class="text-center text-sm text-muted-foreground">
                    {#if isLoading}
                        Loading...
                    {:else if isAtEnd}
                        No more replies.
                    {/if}
                </p>
            {/if}
        </div>
    {/if}
</section>
