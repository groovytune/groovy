<script lang="ts">
    import { auth } from '$lib/client/auth';
    import { EllipsisIcon, ForwardIcon, HeartIcon, MessageCircle, UserRound, UserRoundPlusIcon } from '@lucide/svelte';
    import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
    import { Item, ItemContent, ItemMedia } from '$lib/components/ui/item';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../lib/components/ui/card';
    import { Button } from '../../../lib/components/ui/button';
    import { createAuthRedirect } from '../../../lib/helpers/utils';
    import { page } from '$app/state';
    import ArtistsYouMayKnow from '../../../lib/components/shared/app/home/ArtistsYouMayKnowCard.svelte';
    import SuggestedTracksCard from '../../../lib/components/shared/app/home/SuggestedTracksCard.svelte';
    import { numberFormatter } from '../../../lib/helpers/constants';

    const session = auth.useSession();
</script>

<div class="flex gap-4 px-5 justify-center">
    <aside class="w-full h-fit max-w-xs hidden xl:grid gap-4">
        <h2 class="text-lg font-semibold">Trending</h2>
        <p>Some trending content...</p>
    </aside>
    <section class="w-full h-[200vh] max-w-2xl flex flex-col gap-4">
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
        {#each { length: 10 }}
            <Card class="py-4 gap-2">
                <CardHeader class="flex gap-2 px-4">
                    <a href="#/">
                        <Avatar class="size-9">
                            <AvatarImage src="https://i.pravatar.cc/150?img=3"/>
                            <AvatarFallback>
                                <UserRound class="size-4"/>
                            </AvatarFallback>
                        </Avatar>
                    </a>
                    <a href="#/" class="flex flex-col w-full">
                        <CardTitle class="text-sm font-medium">
                            Sample Post Title
                        </CardTitle>
                        <CardDescription class="text-xs text-muted-foreground">
                            @sampleuser &#183; 2 hours ago
                        </CardDescription>
                    </a>
                    <div class="flex gap-2 w-fit">
                        <Button variant="outline" size="sm" class="ml-auto">
                            Follow
                        </Button>
                        <Button variant="outline" size="icon-sm" class="ml-auto">
                            <EllipsisIcon/>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent class="px-4 mt-2 line-clamp-3 leading-relaxed">
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor odio beatae delectus neque pariatur id laboriosam, in, eum aliquid officiis odit, ducimus alias harum. Recusandae, nam officia. In ex officia iusto molestias animi quidem est adipisci tempore quaerat. Illo molestiae incidunt possimus provident ad laudantium eius? Modi, mollitia nulla reprehenderit tenetur ipsam maxime architecto pariatur. Mollitia a ut similique nemo optio sunt. Adipisci at repudiandae ducimus temporibus nobis eaque dignissimos quo doloremque aut pariatur commodi incidunt, ad inventore animi, placeat velit ratione ut. Ad culpa obcaecati rem asperiores quae sint tempora, maxime id animi ea, maiores dicta perspiciatis harum corporis.
                    </p>
                </CardContent>
                <CardFooter class="px-4 flex gap-2">
                    <Button variant="outline" size="sm">
                        <HeartIcon/>
                        {numberFormatter.format(Math.floor(Math.random() * 2000))}
                    </Button>
                    <Button variant="outline" size="sm">
                        <MessageCircle/>
                        Comments
                    </Button>
                    <Button variant="outline" size="sm">
                        <ForwardIcon/>
                        Share
                    </Button>
                </CardFooter>
            </Card>
        {/each}
    </section>
    <aside class="w-full h-fit max-w-xs hidden md:grid gap-4">
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
            <ArtistsYouMayKnow/>
            <SuggestedTracksCard/>
            <footer class="text-sm text-muted-foreground text-center mt-4">
                <p>&copy; {new Date().getFullYear()} Groovy. All rights reserved.</p>
            </footer>
        {/if}
    </aside>
</div>
