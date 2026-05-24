<script lang="ts">
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "$lib/components/ui/dropdown-menu";
    import { LogOutIcon, MoonIcon, MusicIcon, SunIcon, UserRoundIcon, UserRoundPenIcon } from '@lucide/svelte';
    import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
    import { Button } from '$lib/components/ui/button';
    import { mode, toggleMode } from 'mode-watcher';
    import type { JustUser } from 'better-auth';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import type { ClassValue } from 'tailwind-variants';
    import { createAuthRedirect, createUserProfileURL } from '$lib/helpers/utils';
    import { page } from '$app/state';

    let {
        user,
        class: className
    }: {
        user?: JustUser;
        class?: ClassValue;
    } = $props();
</script>
<DropdownMenu>
    <DropdownMenuTrigger>
        {#snippet child({ props })}
            <Button {...props} variant="ghost" class={["rounded-full sm:size-9 size-10 p-0", className]}>
                <Avatar class="size-full">
                    <AvatarImage src={user?.image} />
                    <AvatarFallback>
                        {#if user?.name?.[0]}
                            {user.name[0].toUpperCase()}
                        {:else}
                            <UserRoundIcon/>
                        {/if}
                    </AvatarFallback>
                </Avatar>
            </Button>
        {/snippet}
    </DropdownMenuTrigger>
    <DropdownMenuContent side="top" align="end" sideOffset={18} class="w-xs">
        {#if !user}
            <DropdownMenuItem>
                {#snippet child({ props })}
                    <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                    <a {...props} href={createAuthRedirect('signin', page.url)}>
                        <Avatar class="size-14">
                            <AvatarFallback>
                                <UserRoundIcon/>
                            </AvatarFallback>
                        </Avatar>
                        <div class="flex flex-col ml-2 truncate">
                            <p class="font-medium leading-tight truncate">
                                Sign In
                            </p>
                            <p class="text-sm text-muted-foreground truncate">
                                Create or sign in to your account
                            </p>
                        </div>
                    </a>
                {/snippet}
            </DropdownMenuItem>
            <DropdownMenuSeparator/>
            <DropdownMenuItem closeOnSelect={false} onclick={toggleMode}>
                {#if mode.current === 'light'}
                    <MoonIcon/>
                    Dark Mode
                {:else}
                    <SunIcon/>
                    Light Mode
                {/if}
            </DropdownMenuItem>
        {:else}
            <DropdownMenuItem>
                {#snippet child({ props })}
                    <a {...props} href={createUserProfileURL(user)}>
                        <Avatar class="size-14">
                            <AvatarImage src={user.image} />
                            <AvatarFallback>{user.name?.[0] ?? 'U'}</AvatarFallback>
                        </Avatar>
                        <div class="flex flex-col ml-2 truncate">
                            <p class="font-medium leading-tight truncate">{user.name}</p>
                            <p class="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </a>
                {/snippet}
            </DropdownMenuItem>
            <DropdownMenuSeparator/>
            <DropdownMenuItem>
                {#snippet child({ props })}
                    <a {...props} href={resolve('/library')}>
                        <MusicIcon/>
                        Releases
                    </a>
                {/snippet}
            </DropdownMenuItem>
            <DropdownMenuItem>
                {#snippet child({ props })}
                    <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                    <a {...props} href={createUserProfileURL(user) + '/edit'}>
                        <UserRoundPenIcon/>
                        Edit Profile
                    </a>
                {/snippet}
            </DropdownMenuItem>
            <DropdownMenuSeparator/>
            <DropdownMenuItem closeOnSelect={false} onclick={toggleMode}>
                {#if mode.current === 'light'}
                    <MoonIcon/>
                    Dark Mode
                {:else}
                    <SunIcon/>
                    Light Mode
                {/if}
            </DropdownMenuItem>
            <DropdownMenuSeparator/>
            <DropdownMenuItem
                onclick={() => {
                    // eslint-disable-next-line svelte/no-navigation-without-resolve
                    goto(resolve('/(auth)/signout') + `?redirect=${encodeURIComponent(page.url.href)}`);
                }}
            >
                <LogOutIcon/>
                Sign Out
            </DropdownMenuItem>
        {/if}
    </DropdownMenuContent>
</DropdownMenu>
