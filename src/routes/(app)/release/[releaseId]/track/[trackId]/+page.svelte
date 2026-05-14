<script lang="ts">
    import { ImageFormat, ImageGravity } from 'appwrite';
    import { Appwrite } from '$lib/client/appwrite.js';
    import coverPlaceholder from '$lib/assets/cover.webp';

    let { data } = $props();

    let coverURL = $derived(
        data.track.cover || data.track.release.cover
            ? Appwrite.storage.getFilePreview({
                bucketId: 'image',
                fileId: data.track.cover || data.track.release.cover!,
                width: 800,
                height: 800,
                gravity: ImageGravity.Center,
                output: ImageFormat.Webp
            })
            : coverPlaceholder
    );
</script>

<div>
    <img src={coverURL} alt={data.track.name + ' cover image'}>
    <h1>{data.track.name}</h1>
    <p>by {data.track.release.user.name}</p>
</div>
