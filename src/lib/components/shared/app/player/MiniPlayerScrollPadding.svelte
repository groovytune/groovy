<script lang="ts">
    import { AudioPlayerContext } from '$lib/contexts/player';

    const audioPlayer = AudioPlayerContext.get();
</script>

{#if audioPlayer.currentTrack}
    <div class="sm:h-17 h-16"></div>
{/if}
