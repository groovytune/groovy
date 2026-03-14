<script lang="ts">
    import { resolve } from '$app/paths';
    import { auth } from '../../lib/client/auth';
    import { Avatar, AvatarFallback, AvatarImage } from '../../lib/components/ui/avatar';
    import { Button } from '../../lib/components/ui/button';

    const session = auth.useSession();
</script>

{#if $session.data?.user}
    <div class="flex gap-2">
        <Avatar>
            <AvatarImage src={$session.data.user.image || undefined}/>
            <AvatarFallback>{$session.data.user.name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <span>{$session.data.user.name}</span>
    </div>
    <Button href={resolve('/(auth)/signout')}>Sign Out</Button>
{:else}
    <Button href={resolve('/(auth)/signin')}>Login</Button>
{/if}
