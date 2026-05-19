<script lang="ts">
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';

    const audioPlayer = AudioPlayer.context.get();
</script>

{#if audioPlayer.currentTrack && !audioPlayer.hidden}
    <div class="sm:h-17 h-16"></div>
{/if}
