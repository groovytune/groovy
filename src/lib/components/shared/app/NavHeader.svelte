<script lang="ts">
    import { resolve } from '$app/paths';
    import { BoomBoxIcon, HouseIcon, LibraryIcon, PlusIcon, SearchIcon, StarIcon } from '@lucide/svelte';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { Button } from '$lib/components/ui/button';
    import { auth } from '$lib/client/auth';
    import { ActiveNavigationPage } from '$lib/contexts/navigation';
    import { cn } from '$lib/helpers/utils';
    import AvatarDropdown from '../AvatarDropdown.svelte';

    const session = auth.useSession();
    const active = ActiveNavigationPage.get();

    const mobileButtonActiveClass = "text-primary! [&_svg]:stroke-3 font-bold relative before:absolute before:top-full before:right-1/2 before:translate-x-1/2 before:w-1/4 before:h-1 before:bg-primary before:rounded-full";
</script>

<header class="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b w-full h-16 flex justify-center">
    <div class="container h-full flex items-center justify-between gap-6 px-5">
        <a href={resolve('/')} class="shrink-0 flex items-center gap-1 self-center font-bold font-fugaz sm:text-lg text-xl text-primary">
			<BoomBoxIcon class="sm:size-6 size-7"/>
			<span class="mt-1">Groovy</span>
		</a>
        <nav class="sm:flex hidden gap-2 md:px-6 px-4 w-full">
            <Button
                href={resolve('/(app)/home')}
                variant={active?.id === 'home' ? 'default' : 'ghost'}
                class="sm:w-auto w-9"
            >
                <HouseIcon/>
                <span class="sm:inline hidden">Home</span>
            </Button>
            <Button
                href={resolve('/(app)/discover')}
                variant={active?.id === 'discover' ? 'default' : 'ghost'}
                class="sm:w-auto w-9"
            >
                <StarIcon/>
                <span class="sm:inline hidden">Discover</span>
            </Button>
            <Button
                href={resolve('/(app)/library')}
                variant={active?.id === 'library' ? 'default' : 'ghost'}
                class="sm:w-auto w-9"
            >
                <LibraryIcon/>
                <span class="sm:inline hidden">Library</span>
            </Button>
        </nav>
        <div class="shrink-0 flex gap-2">
            <Button variant="outline" class="md:justify-start lg:w-xs md:w-auto w-9 sm:inline-flex hidden">
                <SearchIcon/>
                <span class="md:inline hidden">Search</span>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    {#snippet child({ props })}
                        <Button {...props} class="md:w-auto w-9 sm:inline-flex hidden">
                            <PlusIcon/>
                            <span class="md:inline hidden">Create</span>
                        </Button>
                    {/snippet}
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end" sideOffset={18}></DropdownMenuContent>
            </DropdownMenu>
            {#if $session.data?.user}
                <AvatarDropdown user={$session?.data?.user}/>
            {/if}
        </div>
    </div>
</header>

<div class="fixed bottom-0 left-0 w-full z-50 sm:hidden">
    <nav class="w-full overflow-auto border-t bg-background/80 backdrop-blur-sm flex gap-1 p-1">
        <Button
            href={resolve('/(app)/home')}
            variant="ghost"
            class={cn(
                "flex-col h-13 text-xs gap-0 w-1/5 shrink px-0! hover:bg-transparent",
                active?.id === 'home' && mobileButtonActiveClass
            )}
        >
            <HouseIcon class="size-5"/>
        </Button>
        <Button
            href={resolve('/(app)/search')}
            variant="ghost"
            class={cn(
                "flex-col h-13 text-xs gap-0 w-1/5 shrink px-0! hover:bg-transparent",
                active?.id === 'search' && mobileButtonActiveClass
            )}
        >
            <SearchIcon class="size-5"/>
        </Button>
        <Button
            href={resolve('/(app)/release/new')}
            variant="ghost"
            class={cn(
                "flex-col h-13 text-xs gap-0 w-1/5 shrink px-0! py-0! hover:bg-transparent",
                active?.id === 'create' && mobileButtonActiveClass
            )}
        >
            <PlusIcon class="size-5 bg-primary text-primary-foreground rounded-sm w-9 h-6 py-0.5 stroke-3!"/>
        </Button>
        <Button
            href={resolve('/(app)/discover')}
            variant="ghost"
            class={cn(
                "flex-col h-13 text-xs gap-0 w-1/5 shrink px-0! hover:bg-transparent",
                active?.id === 'discover' && mobileButtonActiveClass
            )}
        >
            <StarIcon class="size-5"/>
        </Button>
        <Button
            href={resolve('/(app)/library')}
            variant="ghost"
            class={cn(
                "flex-col h-13 text-xs gap-0 w-1/5 shrink px-0! hover:bg-transparent",
                active?.id === 'library' && mobileButtonActiveClass
            )}
        >
            <LibraryIcon class="size-5"/>
        </Button>
    </nav>
</div>
