<script lang="ts">
    import FollowButton from '$lib/components/shared/app/artist/FollowButton.svelte';

    let { data } = $props();
</script>

<pre>{JSON.stringify(data.user, null, 2)}</pre>

<img src={data.user.image} alt={data.user.name} class="w-32 h-32 rounded-full"/>
<h1 class="text-2xl font-bold">{data.user.name}</h1>
<h3 class="text-lg text-gray-600">@{data.user.username}</h3>
<FollowButton userId={data.user.id}/>
