<script lang="ts">
    import { untrack } from 'svelte';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import { ImageFormat, ImageGravity } from 'appwrite';
    import { beforeNavigate } from '$app/navigation';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';
    import { Image } from '$lib/client/image';

    const audioPlayer = AudioPlayer.context.get();

    $effect(() => {
        if (untrack(() => !('mediaSession' in navigator) && !audioPlayer.releaseInfo.loading)) return;

        const currentTrack = audioPlayer.currentTrack;
        const releaseInfo = audioPlayer.releaseInfo.current;
        const artistInfo = audioPlayer.artistInfo.current;
        const cover = currentTrack?.cover || releaseInfo?.cover;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentTrack?.name,
            artist: artistInfo?.name,
            album: releaseInfo?.name,
            artwork: [
                {
                    src: cover
                        ? Image.getPreviewPath({
                            fileId: cover,
                            width: 512,
                            height: 512,
                            gravity: ImageGravity.Center,
                            output: ImageFormat.Jpeg
                        })
                        : coverPlaceholder
                }
            ]
        });
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

    beforeNavigate(async navigate => {
        if ((!audioPlayer.queue.length && !audioPlayer.currentTrack) || !navigate.willUnload) return;

        const leave = confirm('Your queue will be cleared. Are you sure you want to leave?');
        if (!leave) navigate.cancel();
    });
</script>
