<script lang="ts">
    let { data } = $props();

    let lyrics = $derived(data.lyrics);
</script>

<pre>{JSON.stringify(lyrics, null, 2)}</pre>
