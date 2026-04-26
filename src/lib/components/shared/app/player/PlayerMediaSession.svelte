<script lang="ts">
    import { untrack } from 'svelte';
    import { AudioPlayerContext } from '$lib/contexts/player';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import { Appwrite } from '$lib/client/appwrite';
    import { ImageGravity } from 'appwrite';

    const audioPlayer = AudioPlayerContext.get();

    $effect(() => {
        if (untrack(() => !('mediaSession' in navigator) && !audioPlayer.releaseInfo.loading)) return;

        const currentTrack = audioPlayer.currentTrack;
        const releaseInfo = audioPlayer.releaseInfo.current;
        const cover = currentTrack?.cover || releaseInfo?.cover;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentTrack?.name,
            artist: releaseInfo?.user.name,
            album: releaseInfo?.name,
            artwork: [
                {
                    src: cover
                        ? Appwrite.storage.getFilePreview({
                            bucketId: 'image',
                            fileId: cover,
                            width: 512,
                            height: 512,
                            gravity: ImageGravity.Center
                        })
                        : coverPlaceholder
                }
            ]
        });

        console.log('Media session metadata updated:', navigator.mediaSession.metadata);
    });

    $effect(() => {
        if (untrack(() => !('mediaSession' in navigator))) return;

        navigator.mediaSession.playbackState = !audioPlayer.paused
            ? 'playing'
            : audioPlayer.status !== 'stopped'
                ? 'paused'
                : 'none';

        navigator.mediaSession.setActionHandler('play', () => audioPlayer.play());
        navigator.mediaSession.setActionHandler('pause', () => audioPlayer.pause());
        navigator.mediaSession.setActionHandler('previoustrack', audioPlayer.previousable ? (() => audioPlayer.previous()) : null);
        navigator.mediaSession.setActionHandler('nexttrack', audioPlayer.skippable ? (() => audioPlayer.next()) : null);
        navigator.mediaSession.setActionHandler('stop', audioPlayer.status !== 'stopped' ? (() => audioPlayer.stop()) : null);
    });
</script>
