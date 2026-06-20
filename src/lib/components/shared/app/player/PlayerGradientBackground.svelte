<script lang="ts">
    import { cn } from '$lib/helpers/utils';
    import Kawarp, { type KawarpOptions } from '@kawarp/core';

    let {
        image,
        class: className,
        loaded = $bindable(false),
        ...props
    }: {
        image: string;
        class?: string;
        loaded?: boolean;
    } & KawarpOptions = $props();

    let container: HTMLCanvasElement = $state()!;
    let renderer: Kawarp|null = $state(null);

    $effect(() => {
        renderer = new Kawarp(container,  {
            warpIntensity: 1,
            blurPasses: 7,
            animationSpeed: 0.5,
            saturation: 2.5,
            // dithering: 0.03,
            transitionDuration: 1000,
            tintColor: [0.16, 0.16, 0.24],
            tintIntensity: 0.5,
            scale: 3,
            ...props
        });

        return () => {
            renderer?.dispose();
            renderer = null;
        };
    });

    $effect(() => {
        if (!renderer) return;

        loaded = false;

        renderer
            .loadImage(image)
            .then(() => {
                loaded = true;
                renderer?.start();
            })
            .catch(() => loaded = false);
    });
</script>

<svelte:window onresize={() => renderer?.resize()}/>
<canvas class={cn("size-full brightness-60", className)} bind:this={container}></canvas>
