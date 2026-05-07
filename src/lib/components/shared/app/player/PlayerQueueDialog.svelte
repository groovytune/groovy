<script lang="ts">
    import type { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import { dndzone } from 'svelte-dnd-action';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
    import ResponsiveDialog from '../../ResponsiveDialog.svelte';
    import { cn } from '$lib/helpers/utils';
    import TrackItem from '../release/track/TrackItem.svelte';
    import { AudioPlayer } from '$lib/helpers/classes/AudioPlayer.svelte';

    let {
        dialogState,
        activeTab = $bindable('queue'),
    }: {
        dialogState: DialogState;
        activeTab: 'queue' | 'history';
    } = $props();

    const audioPlayer = AudioPlayer.context.get();
</script>

<ResponsiveDialog {dialogState}>
    {#snippet content({ type })}
        <Tabs bind:value={activeTab} class={cn("w-full", type === 'drawer' ? "px-4" : "")}>
            <TabsList>
                <TabsTrigger value="queue">Queue</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="queue">
                <div
                    use:dndzone={{
                        items: audioPlayer.queue,
                        dragDisabled: !audioPlayer.queue.length,
                        flipDurationMs: 100,
                        delayTouchStart: 500,
                        dropTargetStyle: {},
                        useCursorForDetection: true
                    }}
                    onconsider={e => audioPlayer.queue = e.detail.items}
                    onfinalize={e => audioPlayer.queue = e.detail.items}
                    class="flex flex-col gap-2 py-4"
                >
                    {#each audioPlayer.queue as track, index (track.id)}
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-muted-foreground">{index + 1}</span>
                            <TrackItem
                                {track}
                                cover={true}
                            />
                        </div>
                    {/each}
                </div>
            </TabsContent>
            <TabsContent value="history">
                <p>History content goes here.</p>
            </TabsContent>
        </Tabs>
    {/snippet}
</ResponsiveDialog>
