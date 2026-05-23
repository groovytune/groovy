<script lang="ts">
    import { DateTime } from 'luxon';
    import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar/index.js';
    import { createUserProfileURL } from '$lib/helpers/utils.js';
    import FollowButton from '$lib/components/shared/app/artist/FollowButton.svelte';
    import { auth } from '$lib/client/auth.js';
    import { Button } from '../../../../lib/components/ui/button/index.js';
    import { EllipsisIcon } from '@lucide/svelte';

    let { data } = $props();

    const session = auth.useSession();

    let post = $derived(data.post);
    let user = $derived(post.user);
</script>

<section class="flex justify-center">
    <div class="w-full max-w-2xl py-5">
        <div class="flex items-center gap-3">
            <a href={createUserProfileURL(user)}>
                <Avatar class="size-9">
                    <AvatarImage src={user.image}/>
                    <AvatarFallback>
                        {user.name.charAt(0).toLowerCase()}
                    </AvatarFallback>
                </Avatar>
            </a>
            <a href={createUserProfileURL(user)} class="flex flex-col w-full truncate">
                <h3 class="text-sm font-medium text-balance line-clamp-2">
                    {user.name}
                </h3>
                <p class="text-xs text-muted-foreground text-balance line-clamp-1">
                    {#if user.username}
                        @{user.username} &middot;
                    {/if}
                    {DateTime.fromISO(String(post.createdAt)).toRelative()}
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
    </div>
</section>
