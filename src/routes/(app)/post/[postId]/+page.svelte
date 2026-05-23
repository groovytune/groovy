<script lang="ts">
    import { DateTime } from 'luxon';
    import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar/index.js';
    import { createUserProfileURL, getPostMediaFiles } from '$lib/helpers/utils.js';
    import FollowButton from '$lib/components/shared/app/artist/FollowButton.svelte';
    import { auth } from '$lib/client/auth.js';
    import { Button } from '$lib/components/ui/button/index.js';
    import { CornerUpRightIcon, EllipsisIcon, ForwardIcon, HeartIcon, MessageCircle } from '@lucide/svelte';
    import PostMediaGrid from '$lib/components/shared/app/post/PostMediaGrid.svelte';
    import { onMount } from 'svelte';
    import LikeButton from '$lib/components/shared/app/LikeButton.svelte';
    import { numberFormatter } from '$lib/helpers/constants.js';
    import PostForm from '$lib/components/shared/app/post/forms/PostForm.svelte';
    import PostFormFields from '../../../../lib/components/shared/app/post/forms/PostFormFields.svelte';
    import { Item, ItemContent, ItemMedia, ItemTitle } from '../../../../lib/components/ui/item/index.js';
    import { resolve } from '$app/paths';

    let { data } = $props();

    const session = auth.useSession();

    let post = $derived(data.post);
    let user = $derived(post.user);
    let media: { type: 'image'|'video'; url: string; }[] = $state([]);
    let likes = $derived(post._count.likes);

    let replyTextarea: HTMLTextAreaElement|null = $state(null);

    onMount(async () => {
        if (post.media) {
            media = await getPostMediaFiles(post.media);
        }
    });
</script>

<section class="flex flex-col gap-2 items-center sm:px-2 sm:pt-5 pb-5">
    <div class="w-full max-w-2xl py-5 border-y sm:border-x border-x-0 sm:rounded-lg grid gap-5">
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
            <Button variant="outline" size="sm" onclick={() => replyTextarea?.focus()}>
                <MessageCircle/>
                Reply
            </Button>
            <Button variant="outline" size="sm">
                <ForwardIcon/>
                Share
            </Button>
        </div>
    </div>
    <PostForm
        data={{
            content: '',
            referenceId: post.id
        }}
        class="w-full max-w-2xl grid gap-2"
    >
        {#snippet children({ form })}
            <PostFormFields
                {form}
                bind:textarea={replyTextarea}
                placeholder="Write a reply..."
            />
        {/snippet}
    </PostForm>
</section>
