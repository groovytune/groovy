<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import type { BackgroundRender, MeshGradientRenderer } from '@applemusic-like-lyrics/core';
    import { cn } from '$lib/helpers/utils';

    let {
        image,
        loaded = $bindable(false),
        playing = true,
        fps = 30,
        flowSpeed = 2,
        renderScale = 2,
        staticMode = false,
        lowFreqVolume = 2.5,
        hasLyric = true,
        class: className,
    }: {
        image: string|HTMLImageElement;
        loaded?: boolean;
        playing?: boolean;
        fps?: number;
        flowSpeed?: number;
        renderScale?: number;
        staticMode?: boolean;
        lowFreqVolume?: number;
        hasLyric?: boolean;
        class?: string;
    } = $props();

    let container: HTMLDivElement = $state()!;
    let renderer: BackgroundRender<MeshGradientRenderer>|null = $state(null);

    onMount(async () => {
        const { BackgroundRender, MeshGradientRenderer } = await import('@applemusic-like-lyrics/core');

        renderer = BackgroundRender.new(MeshGradientRenderer);

        const element = renderer.getElement();
        element.style.width = '100%';
        element.style.height = '100%';

        // eslint-disable-next-line svelte/no-dom-manipulating
        container.appendChild(element);
    });

    onDestroy(() => {
        renderer?.dispose();
    });

    $effect(() => {
        if (!renderer) return;

        if (playing) {
            renderer.resume();
        } else {
            renderer.pause();
        }

        renderer.setFPS(fps);
        renderer.setFlowSpeed(flowSpeed);
        renderer.setRenderScale(renderScale);
        renderer.setStaticMode(staticMode);
        renderer.setLowFreqVolume(lowFreqVolume);
        renderer.setHasLyric(hasLyric);
    });

    $effect(() => {
        if (!renderer) return;

        loaded = false;

        renderer
            .setAlbum(image)
            .then(() => loaded = hasCover())
    });

    function hasCover() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mesh = (renderer as any)?.renderer as { isNoCover?: boolean; };
        return mesh && 'isNoCover' in mesh && !mesh.isNoCover;
    }
</script>

<div class={cn("size-full", className)} bind:this={container}></div>
