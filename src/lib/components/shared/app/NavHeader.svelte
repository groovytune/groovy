<script lang="ts">
    import { resolve } from '$app/paths';
    import { BoomBoxIcon, HouseIcon, LibraryIcon, PlusIcon, SearchIcon, StarIcon } from '@lucide/svelte';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
    import { Button } from '$lib/components/ui/button';
    import { auth } from '$lib/client/auth';

    const session = auth.useSession();
</script>

<header class="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b w-full h-16 flex justify-center">
    <div class="container h-full flex items-center justify-between gap-6 px-5">
        <a href={resolve('/')} class="shrink-0 flex items-center gap-1 self-center font-bold font-fugaz sm:text-lg text-xl text-primary">
			<BoomBoxIcon class="sm:size-6 size-7"/>
			<span class="mt-1">Groovy</span>
		</a>
        <nav class="sm:flex hidden gap-2 md:px-6 px-4 w-full">
            <Button class="sm:w-auto w-9">
                <HouseIcon/>
                <span class="sm:inline hidden">Home</span>
            </Button>
            <Button variant="secondary" class="sm:w-auto w-9">
                <StarIcon/>
                <span class="sm:inline hidden">Discover</span>
            </Button>
            <Button variant="secondary" class="sm:w-auto w-9">
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
            <DropdownMenu>
                <DropdownMenuTrigger>
                    {#snippet child({ props })}
                        <Button {...props} variant="ghost" class="rounded-full sm:size-9 size-10 p-0">
                            <Avatar class="size-full">
                                <AvatarImage src={$session?.data?.user?.image} />
                                <AvatarFallback>{$session?.data?.user?.name?.[0] ?? 'U'}</AvatarFallback>
                            </Avatar>
                        </Button>
                    {/snippet}
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end" sideOffset={18}></DropdownMenuContent>
            </DropdownMenu>
        </div>
    </div>
</header>

<div class="fixed bottom-0 left-0 w-full z-50 sm:hidden">
    <nav class="w-full overflow-auto border-t bg-background/80 backdrop-blur-sm flex gap-1 p-1">
        <Button variant="ghost" class="flex-col h-13 text-xs gap-0 w-1/5 shrink px-0! hover:bg-transparent">
            <HouseIcon class="size-5"/>
            <span class="text-muted-foreground">Home</span>
        </Button>
        <Button variant="ghost" class="flex-col h-13 text-xs gap-0 w-1/5 shrink px-0! hover:bg-transparent">
            <StarIcon class="size-5"/>
            <span class="text-muted-foreground">Discover</span>
        </Button>
        <Button variant="ghost" class="flex-col h-13 text-xs gap-0 w-1/5 shrink px-0! py-0! hover:bg-transparent">
            <PlusIcon class="size-5 bg-primary text-primary-foreground rounded-sm w-8 h-6 py-0.5 stroke-3!"/>
            <span class="text-muted-foreground">Create</span>
        </Button>
        <Button variant="ghost" class="flex-col h-13 text-xs gap-0 w-1/5 shrink px-0! hover:bg-transparent">
            <SearchIcon class="size-5"/>
            <span class="text-muted-foreground">Search</span>
        </Button>
        <Button variant="ghost" class="flex-col h-13 text-xs gap-0 w-1/5 shrink px-0! hover:bg-transparent">
            <LibraryIcon class="size-5"/>
            <span class="text-muted-foreground">Library</span>
        </Button>
    </nav>
</div>
