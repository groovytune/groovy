<script lang="ts">
    import type { Post } from '$lib/server/prisma/browser';
    import { EllipsisIcon, FlagIcon, TrashIcon } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import DropdownMenuContent from '$lib/components/ui/dropdown-menu/dropdown-menu-content.svelte';
    import { auth } from '$lib/client/auth';

    let {
        post
    }: {
        post: Post;
    } = $props();

    const session = auth.useSession();
</script>

<DropdownMenu>
    <DropdownMenuTrigger>
        {#snippet child({ props })}
            <Button
                {...props}
                variant="outline"
                size="icon-sm"
                class={[
                    "ml-auto",
                    !$session.data?.user.id && "hidden"
                ]}
            >
                <EllipsisIcon/>
            </Button>
        {/snippet}
    </DropdownMenuTrigger>
    <DropdownMenuContent>
        {#if $session.data?.user.id && post.userId === $session.data?.user.id}
            <DropdownMenuItem class="text-destructive!">
                <TrashIcon class="text-destructive"/>
                Delete
            </DropdownMenuItem>
        {:else if $session.data?.user.id}
            <!-- TODO: Implement report functionality -->
            <DropdownMenuItem>
                <FlagIcon/>
                Report
            </DropdownMenuItem>
        {/if}
    </DropdownMenuContent>
</DropdownMenu>
