<script lang="ts">
    import { Disc3Icon } from '@lucide/svelte';
    import { auth } from '../../../../lib/client/auth.js';
    import FollowButton from '../../../../lib/components/shared/app/artist/FollowButton.svelte';
    import ArtistsYouMayKnowCard from '../../../../lib/components/shared/app/home/ArtistsYouMayKnowCard.svelte';
    import SuggestedTracksCard from '../../../../lib/components/shared/app/home/SuggestedTracksCard.svelte';
    import TrackItem from '../../../../lib/components/shared/app/release/track/TrackItem.svelte';
    import { Avatar, AvatarFallback, AvatarImage } from '../../../../lib/components/ui/avatar/index.js';
    import { Badge } from '../../../../lib/components/ui/badge/index.js';
    import Button from '../../../../lib/components/ui/button/button.svelte';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../lib/components/ui/card/index.js';
    import { AudioPlayer } from '../../../../lib/helpers/classes/AudioPlayer.svelte.js';
    import { numberFormatter } from '../../../../lib/helpers/constants.js';
    import SquareReleaseItem from '../../../../lib/components/shared/app/release/SquareReleaseItem.svelte';
    import MostStreamedTracksCard from '../../../../lib/components/shared/app/artist/MostStreamedTracksCard.svelte';


    let { data } = $props();

    let user = $derived(data.user);

    const audioPlayer = AudioPlayer.context.get();
    const session = auth.useSession();
</script>

<div class="flex gap-4 px-5 justify-center-safe">
    <section class="w-full max-w-4xl flex flex-col gap-4 pb-5">
        <div class="flex sm:flex-row flex-col gap-5 border bg-card p-5 rounded-xl relative overflow-hidden">
            <div class="sm:hidden absolute top-0 left-0 h-24 w-full bg-primary">
                <div class="absolute top-0 left-0 backdrop-blur-2xl size-full brightness-75 saturate-150"></div>
                <img src={user.image} alt={user.name} class="size-full object-cover"/>
            </div>
            <Avatar class="size-32">
                <AvatarImage src={user.image}/>
                <AvatarFallback>
                    {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div class="flex flex-col w-full">
                <div class="flex items-center justify-between w-full py-2">
                    <div class="flex flex-col">
                        <p class="text-sm text-muted-foreground leading-tight line-clamp-1">
                            {#if user.username}
                                @{user.username ?? 'unknown'}
                            {/if}
                        </p>
                        <h1 class="text-2xl font-bold line-clamp-2">
                            {user.name}
                        </h1>
                    </div>
                    {#if user.id !== $session.data?.user?.id}
                        <FollowButton userId={user.id} size="sm"/>
                    {:else}
                        <Button variant="outline" size="sm">
                            Edit Profile
                        </Button>
                    {/if}
                </div>
                <div class="flex gap-4 w-full text-sm">
                    <p>
                        <span class="font-bold">{numberFormatter.format(user._count.followers)}</span>
                        <span class="text-muted-foreground"> follower{user._count.followers !== 1 ? 's' : ''}</span>
                    </p>
                    <p>
                        <span class="font-bold">{numberFormatter.format(user._count.following)}</span>
                        <span class="text-muted-foreground"> following{user._count.following !== 1 ? 's' : ''}</span>
                    </p>
                    <p>
                        <span class="font-bold">{numberFormatter.format(user._count.releases)}</span>
                        <span class="text-muted-foreground"> release{user._count.releases !== 1 ? 's' : ''}</span>
                    </p>
                </div>
                <div class="mt-2 text-foreground/90 text-base flex flex-col gap-2">
                    {#if user.genres.length}
                        <div class="flex gap-1 flex-wrap">
                            {#each user.genres as genre (genre.id)}
                                <Badge variant="outline">{genre.name}</Badge>
                            {/each}
                        </div>
                    {/if}
                    <p class="whitespace-break-spaces leading-tight" style="word-wrap: break-word;">
                        {#if user.bio}
                            {user.bio}
                        {:else}
                            <i class="text-muted-foreground text-xs">No more information available.</i>
                        {/if}
                    </p>
                    {#if user.favoriteTrack}
                        <TrackItem
                            onclick={async () => {
                                if (!user.favoriteTrack) return;

                                await audioPlayer.replaceCurrentTrack(user.favoriteTrack);
                                await audioPlayer.play();
                            }}
                            track={user.favoriteTrack}
                            variant="outline"
                            cover
                        />
                    {/if}
                </div>
            </div>
        </div>
        <MostStreamedTracksCard {user}/>
        <Card>
            <CardHeader>
                <CardTitle class="flex items-center gap-1">
                    <Disc3Icon class="size-5 -mt-1 text-primary"/>
                    Releases
                </CardTitle>
                <CardDescription>
                    All releases by {user.name}
                </CardDescription>
            </CardHeader>
            <CardContent class="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {#each { length: 6 }}
                    <SquareReleaseItem
                        name="Release Name"
                        description="Artist Name · Album · 1.2K likes"
                        explicit
                        coverURL="https://placehold.co/300x300/png"
                        href="#"
                    />
                {/each}
            </CardContent>
        </Card>
    </section>
    <aside class="w-full h-fit max-w-xs hidden lg:grid gap-4 shrink-0">
        <ArtistsYouMayKnowCard/>
        <SuggestedTracksCard/>
    </aside>
</div>
