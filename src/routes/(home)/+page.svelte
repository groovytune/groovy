<script lang="ts">
    import { resolve } from '$app/paths';
    import { auth } from '$lib/client/auth';
    import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
    import { Button } from '$lib/components/ui/button';
    import ExplicitIcon from '$lib/components/shared/ExplicitIcon.svelte';
    import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';

    let { data } = $props();

    const session = auth.useSession();
</script>

<div class="text-center px-4 py-8">
    {#if $session.data?.user}
        <Avatar class="size-16 inline-block">
            <AvatarImage src={$session.data.user.image}/>
            <AvatarFallback>
                {$session.data.user.name?.[0] ?? 'U'}
            </AvatarFallback>
        </Avatar>
        <h1>Welcome, {$session.data.user.name}!</h1>
        <p>You are logged in with the email: {$session.data.user.email}</p>
        <Button href={resolve('/(auth)/signout')}>
            Sign Out
        </Button>
        <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 mt-5 text-start">
            {#each data.releases as release (release.id)}
                <Card class="shrink-0">
                    <CardHeader>
                        <CardTitle>
                            {release.name}
                            {#if release.explicit}
                                <ExplicitIcon/>
                            {/if}
                        </CardTitle>
                        <CardDescription>{release.id}</CardDescription>
                        <CardAction>
                            <Button href={resolve('/(app)/release/[id]/edit/tracks', { id: release.id })}>
                                Manage
                            </Button>
                        </CardAction>
                    </CardHeader>
                    <CardFooter>
                        <p class="text-xs">
                            {release.createdAt.toString()}
                        </p>
                    </CardFooter>
                </Card>
            {/each}
        </div>
    {:else}
        <h1>Welcome to the Home Page!</h1>
        <p>Please log in to access your account.</p>
        <Button href={resolve('/(auth)/signin')}>
            Sign In
        </Button>
    {/if}
</div>
