<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { cn } from '$lib/helpers/utils';

    let props: HTMLAttributes<HTMLSpanElement> = $props();
</script>

<span
    {...props}
    class={cn(
        "text-xs inline-block bg-foreground/70 text-background rounded-xs size-4 align-middle leading-4 mb-1",
        props.class
    )}
>
    E
</span>
