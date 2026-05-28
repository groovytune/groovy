<script lang="ts">
    import { Button } from '$lib/components/ui/button/index.js';
    import { parseLyrics } from '$lib/helpers/lyrics.js';
    import { Image } from '$lib/client/image.js';
    import { ImageFormat } from 'appwrite';
    import coverPlaceholder from '$lib/assets/cover.webp';
    import { fade } from 'svelte/transition';
    import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '$lib/components/ui/item/index.js';
    import { BoomBoxIcon, DownloadIcon, SmartphoneIcon, SquareDashedIcon } from '@lucide/svelte';
    import { cn } from '$lib/helpers/utils.js';
    import html2canvas from 'html2canvas-pro';
    import PlayerGradientBackground from '$lib/components/shared/app/player/PlayerGradientBackground.svelte';
    import { onMount } from 'svelte';

    let { data } = $props();

    let track = $derived(data.track);
    let lines = $derived.by(() => {
        if (!track.lyrics) return [];

        const content = parseLyrics(track.lyrics);
        if (typeof content === 'string') return content.split('\n');

        return content.map(line => line.words.map(w => w.word).join(''));
    });


    let backgroundLoaded = $state(false);
    let coverURL = $derived(
        track?.cover || track.release.cover
            ? Image.getPreviewPath({
                fileId: track?.cover || track.release.cover!,
                width: 500,
                height: 500,
                output: ImageFormat.Webp
            })
            : coverPlaceholder
    );

    let range: number[] = $state([]);
    let selected: string[] = $derived.by(() => {
        if (range.length === 0) return [];
        if (range.length === 1) return [lines[range[0]]];
        return lines.slice(range[0], range[1] + 1);
    });

    let container: HTMLDivElement|null = $state(null);
    let fixedAspectRatio = $state(false);

    function editRange(num: number, maxRangeSize = 4) {
        if (range.length === 2) {
            range = [num];
            return;
        }

        range = range.includes(num) ? range.filter(n => n !== num) : [...range, num].sort((a, b) => a - b);

        if (getRangeSize(range) > maxRangeSize) {
            range = [num];
        }
    }

    function inRange(num: number) {
        if (range.length === 0) return false;
        if (range.length === 1) return num === range[0];
        return num >= range[0] && num <= range[1];
    }

    function getRangeSize(range: number[]) {
        if (range.length === 0) return 0;
        if (range.length === 1) return 1;
        return range[1] - range[0] + 1;
    }

    async function download() {
        if (!container) return;

        const data = await html2canvas(container);
        const url = data.toDataURL('image/png');

        const link = document.createElement('a');

        link.href = url;
        link.download = `${track.name}-lyrics.png`;
        link.click();

        URL.revokeObjectURL(url);
        link.remove();
    }

    onMount(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const origGetContext = HTMLCanvasElement.prototype.getContext as any;

        HTMLCanvasElement.prototype.getContext = function(type, attribs) {
            attribs ||= {};
            attribs.preserveDrawingBuffer = true;
            return origGetContext.call(this, type, attribs);
        };

        return () => {
            HTMLCanvasElement.prototype.getContext = origGetContext;
        };
    });
</script>

<section class="flex justify-center px-5 py-10">
    <div class="container flex flex-col-reverse lg:flex-row lg:justify-center-safe lg:gap-2 gap-10 relative">
        <div class="flex flex-col gap-2 w-full lg:max-w-[400px]">
            <!-- eslint-disable-next-line svelte/require-each-key -->
            {#each lines as line, index}
                <Button
                    variant={inRange(index) ? "default" : "outline"}
                    size="lg"
                    class="block rounded-lg h-auto p-2 whitespace-normal text-start text-xl font-semibold leading-tight"
                    style="content-visibility: auto;"
                    onclick={() => editRange(index)}
                >
                    {line}
                </Button>
            {/each}
        </div>
        <div class="w-full lg:max-w-[400px] flex flex-col gap-4">
            <div
                bind:this={container}
                class={cn(
                    "relative overflow-hidden bg-black flex items-center p-2 rounded-xl min-h-[200px] max-w-[400px] w-full dark",
                    fixedAspectRatio && "aspect-9/16"
                )}
            >
                {#if selected.length}
                <div class="w-full relative z-10">
                    <Item class="p-2">
                        <ItemMedia>
                            <img src={coverURL} alt={track.name} class="size-16 rounded object-cover"/>
                        </ItemMedia>
                        <ItemContent class="gap-0">
                            <ItemTitle class="text-base font-semibold leading-tight text-white">
                                {track.name}
                            </ItemTitle>
                            <ItemDescription class="text-xs leading-tight text-white/70">
                                {track.release.user.name} &middot; {track.release.name}
                            </ItemDescription>
                        </ItemContent>
                    </Item>
                    <div class="text-white/80 text-2xl font-bold py-4 px-2 leading-relaxed flex flex-col gap-1">
                        <!-- eslint-disable-next-line svelte/require-each-key -->
                        {#each selected as line}
                            <p>{line}</p>
                        {/each}
                    </div>
                    <div class="text-white/70 text-sm sm:text-base font-semibold py-2 px-2 flex items-center gap-1">
                        <BoomBoxIcon class="size-5 mb-1"/>
                        <span>Groovy</span>
                    </div>
                </div>
                {:else}
                    <div class="flex flex-col p-10 sm:p-16 z-10 relative">
                        <img src={coverURL} alt="Track cover" class="rounded-lg"/>
                        <div>
                            <h2 class="text-xl sm:text-2xl font-bold mt-4">{track.name}</h2>
                            <p class="text-sm text-muted-foreground">{track.release.user.name} &middot; {track.release.name}</p>
                        </div>
                    </div>
                {/if}
                <div class="absolute top-0 left-0 size-full">
                    <PlayerGradientBackground
                        image={coverURL}
                        playing={true}
                        bind:loaded={backgroundLoaded}
                        class="size-full"
                    />
                    {#if !backgroundLoaded}
                        <div transition:fade={{ duration: 1000 }} class="size-full absolute top-0 left-0 -z-10">
                            <div class="size-full absolute top-0 left-0 backdrop-blur-3xl backdrop-saturate-150 backdrop-brightness-70"></div>
                            <img src={coverURL} alt={track?.name} class="size-full object-cover"/>
                        </div>
                    {/if}
                </div>
            </div>
            <div class="flex justify-center">
                <Button variant="outline" size="lg" onclick={download}>
                    <DownloadIcon/>
                    Download Image
                </Button>
                <Button variant="outline" size="icon-lg" onclick={() => fixedAspectRatio = !fixedAspectRatio} class="ml-2">
                    {#if fixedAspectRatio}
                        <SquareDashedIcon/>
                    {:else}
                        <SmartphoneIcon/>
                    {/if}
                </Button>
            </div>
        </div>
    </div>
</section>
