<script lang="ts">
    import { MediaQuery } from 'svelte/reactivity';
    import { AudioPlayerContext } from '$lib/contexts/player';

    const audioPlayer = AudioPlayerContext.get();
    const smallScreen = new MediaQuery('(width >= 40rem)', true);
</script>

{#if audioPlayer.currentTrack || (!audioPlayer.currentTrack && smallScreen.current)}
    <div class="sm:h-15 h-16"></div>
{/if}
