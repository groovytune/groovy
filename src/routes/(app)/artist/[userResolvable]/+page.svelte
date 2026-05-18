<script lang="ts">
    let { data } = $props();
</script>

<pre>{JSON.stringify(data.user, null, 2)}</pre>

<img src={data.user?.image} alt={data.user?.name ?? "Artist Avatar"} class="w-32 h-32 rounded-full"/>
<h1 class="text-2xl font-bold">{data.user?.name}</h1>
