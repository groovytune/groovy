<script lang="ts">
    import { auth } from '$lib/client/auth';
    import { UserRound, UserRoundPlusIcon } from '@lucide/svelte';
    import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
    import { Item, ItemContent, ItemMedia } from '$lib/components/ui/item';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../lib/components/ui/card';
    import { Button } from '../../../lib/components/ui/button';
    import { createAuthRedirect } from '../../../lib/helpers/utils';
    import { page } from '$app/state';

    const session = auth.useSession();
</script>

<div class="flex gap-4 p-5">
    <aside class="w-full max-w-xs hidden xl:grid gap-4">
        <h2 class="text-lg font-semibold">Trending</h2>
        <p>Some trending content...</p>
    </aside>
    <section class="w-full max-w-3xl">
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
    <aside class="w-full max-w-xs hidden md:grid gap-4">
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
            <Card>
                <CardHeader>
                    <CardTitle>
                        Welcome back, {$session.data.user.name}!
                    </CardTitle>
                    <CardDescription>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                </CardContent>
            </Card>
        {/if}
    </aside>
</div>
