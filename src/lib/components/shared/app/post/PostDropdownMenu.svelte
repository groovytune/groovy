<script lang="ts">
    import type { Post } from '$lib/server/prisma/browser';

    let {
        post
    }: {
        post: Post;
    } = $props();
</script>
