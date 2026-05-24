<script lang="ts">
    import { HeartIcon, LibraryBigIcon } from '@lucide/svelte';
    import ReleasesCard from '$lib/components/shared/app/artist/ReleasesCard.svelte';
    import { auth } from '../../../lib/client/auth';
    import { resolve } from '$app/paths';
    import TracksCard from '../../../lib/components/shared/app/artist/TracksCard.svelte';

    const session = auth.useSession();
</script>

<h1 class="text-2xl sm:text-4xl font-bold my-4 px-5 flex items-center gap-2">
    <LibraryBigIcon class="text-primary size-7 sm:size-8"/>
    Your Library
</h1>
<section class="p-5 pt-0 grid md:grid-cols-2 gap-4">
    {#if $session.data?.user}
        <div class="col-span-full">
            <ReleasesCard
                user={$session.data.user}
                title="Your Releases"
                description="All releases in your library"
                class="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            />
        </div>
        <ReleasesCard
            user={$session.data.user}
            title="Liked Releases"
            description="All releases you've liked"
            icon={HeartIcon}
            route={resolve('/(app)/api/liked/releases')}
        />
        <TracksCard
            title="Liked Tracks"
            description="All tracks you've liked"
            route={resolve('/(app)/api/liked/tracks')}
        />
    {/if}
</section>
