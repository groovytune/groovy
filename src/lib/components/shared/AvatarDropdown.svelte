<script lang="ts">
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "$lib/components/ui/dropdown-menu";
    import { BoltIcon, MoonIcon, MusicIcon, SunIcon } from '@lucide/svelte';
    import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
    import { Button } from '$lib/components/ui/button';
    import { mode, toggleMode } from 'mode-watcher';
    import type { JustUser } from 'better-auth';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';

    let {
        user
    }: {
        user: JustUser;
    } = $props();
</script>
<DropdownMenu>
    <DropdownMenuTrigger>
        {#snippet child({ props })}
            <Button {...props} variant="ghost" class="rounded-full sm:size-9 size-10 p-0">
                <Avatar class="size-full">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>{user.name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>
            </Button>
        {/snippet}
    </DropdownMenuTrigger>
    <DropdownMenuContent side="top" align="end" sideOffset={18} class="w-64">
        <DropdownMenuItem onclick={() => goto(resolve('/(app)/home'))}>
            <Avatar class="size-14">
                <AvatarImage src={user.image} />
                <AvatarFallback>{user.name?.[0] ?? 'U'}</AvatarFallback>
            </Avatar>
            <div class="flex flex-col ml-2 truncate">
                <p class="font-medium leading-tight truncate">{user.name}</p>
                <p class="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator/>
        <DropdownMenuItem>
            <MusicIcon/>
            Releases
        </DropdownMenuItem>
        <DropdownMenuItem>
            <BoltIcon/>
            Settings
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
    </DropdownMenuContent>
</DropdownMenu>
