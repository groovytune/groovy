<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import type { BackgroundRender, MeshGradientRenderer } from '@applemusic-like-lyrics/core';
    import { cn } from '$lib/helpers/utils';

    let {
        image,
        playing = true,
        fps = 60,
        flowSpeed = 2.5,
        renderScale = 1,
        staticMode = false,
        lowFreqVolume = 0,
        hasLyric = true,
        class: className
    }: {
        image: string|HTMLImageElement;
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

        setImage(image);
    });

    async function setImage(image: string|HTMLImageElement) {
        if (!renderer) return;

        await renderer
            .setAlbum(image)
            .catch(error => {
                console.error('Failed to set album image:', error);
                setImage(image);
            });
    }
</script>

<div class={cn("size-full", className)} bind:this={container}></div>
