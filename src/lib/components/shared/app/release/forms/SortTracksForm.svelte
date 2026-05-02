<script lang="ts">
    import { ListMusicIcon, LoaderIcon, RotateCcwIcon, SaveIcon } from '@lucide/svelte';
    import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '$lib/components/ui/empty';
    import { superForm, type SuperForm, type SuperValidated } from 'sveltekit-superforms';
    import { sortTracksSchema } from '$lib/schema/track';
    import { Button } from '$lib/components/ui/button';
    import { dndzone } from 'svelte-dnd-action';
    import { flip } from 'svelte/animate';
    import { toast } from 'svelte-sonner';
    import type z from 'zod';
    import { resolve } from '$app/paths';
    import type { Track } from '$lib/server/prisma/browser';
    import { zod4Client } from 'sveltekit-superforms/adapters';
    import TrackItemShadow from '../track/TrackItemShadow.svelte';
    import TrackItem from '../track/TrackItem.svelte';

    let {
        releaseId,
        tracks = $bindable([]),
        data,
        form = $bindable(null),
        onupdate
    }: {
        releaseId: string;
        tracks: Track[];
        data?: SuperValidated<z.infer<typeof sortTracksSchema>>;
        form?: SuperForm<z.infer<typeof sortTracksSchema>>|null;
        onupdate?: (tracks: { id: string; position: number; }[]) => void;
    } = $props();

    // svelte-ignore state_referenced_locally
    form = superForm(data ?? { tracks: [] }, {
        id: `sort-tracks-${releaseId}`,
        validators: zod4Client(sortTracksSchema),
        dataType: 'json',
        taintedMessage: true,
        invalidateAll: false,
        resetForm: false,
        onError: event => {
            console.error('Form submission error:', event.result);
            toast.error(event.result.error.message);
        },
        onResult: event => {
            const { type } = event.result;

            if (type === 'failure') {
                console.error('Sort form submission failed:', event.result);
                toast.error(event.result.data?.message ?? 'Failed to update track order.');
                return;
            }

            if (type != 'success') return;

            const message = event.result.data?.form.message;
            const newTracks = message.tracks as { id: string; position: number; }[];

            toast.success(message.message ?? `Updated track order for ${newTracks.length} track${newTracks.length > 1 ? 's' : ''}`);

            newTracks.sort((a, b) => a.position - b.position);

            form?.form.update(
                f => {
                    f.tracks = newTracks;
                    return f;
                },
                { taint: 'untaint-all' }
            );

            onupdate?.(newTracks);
        }
    });

    const { form: formData, enhance, submitting, tainted } = form;

    let dndTracks = $derived($formData.tracks.toSorted((a, b) => a.position - b.position));
</script>

{#if $formData.tracks.length > 0}
    <section class="py-5 px-2.5 w-full pt-0 md:pt-5">
        <div
            use:dndzone={{
                dragDisabled: $submitting || $formData.tracks.length < 2,
                items: dndTracks,
                flipDurationMs: 100,
                delayTouchStart: 500,
                dropTargetStyle: {},
                useCursorForDetection: true
            }}
            onconsider={e => dndTracks = e.detail.items.map((item, index) => ({ ...item, position: index + 1 }))}
            onfinalize={e => dndTracks = $formData.tracks = e.detail.items.map((item, index) => ({ ...item, position: index + 1 }))}
            class="grid gap-2"
        >
            {#each dndTracks as dndTrack, index (dndTrack.id)}
                {@const track = tracks.find(t => t.id === dndTrack.id)}
                <div
                    animate:flip={{ duration: 100 }}
                    class="select-none cursor-default min-h-14 flex items-center gap-2"
                >
                    <span class="text-sm text-muted-foreground hidden md:block">
                        {index + 1}
                    </span>
                    {#if track}
                        <TrackItem
                            track={track}
                            editable={true}
                            ondelete={() => {
                                tracks = tracks.filter(t => t.id !== dndTrack.id);
                                form?.form.update(f => {
                                    f.tracks = f.tracks.filter(t => t.id !== dndTrack.id);
                                    return f;
                                }, { taint: 'untaint-all' });
                            }}
                        />
                    {:else}
                        <TrackItemShadow/>
                    {/if}
                </div>
            {/each}
        </div>
        {#if $tainted?.tracks}
            <form
                use:enhance
                method="POST"
                action={resolve('/(app)/release/[id]/edit/tracks', { id: releaseId }) + '?/sort'}
                class="flex justify-center py-5 pb-0 gap-2"
            >
                <Button
                    variant="outline"
                    onclick={() => form.reset()}
                >
                    <RotateCcwIcon/>
                    Reset
                </Button>
                <Button
                    onclick={() => form.submit()}
                    disabled={$submitting || $formData.tracks.length === 0}
                >
                    {#if $submitting}
                        <LoaderIcon class="animate-spin"/>
                        Save
                    {:else}
                        <SaveIcon/>
                        Save
                    {/if}
                </Button>
            </form>
        {/if}
        <div class="text-center pt-5">
            <p class="text-xs text-muted-foreground">
                {$formData.tracks.length} track{$formData.tracks.length !== 1 ? 's' : ''} • Drag and drop to reorder
            </p>
        </div>
    </section>
{:else}
    <div class="flex justify-center w-full" style="content-visibility: auto;">
        <Empty class="bg-muted/50 m-5 py-10 gap-0 min-h-72 max-w-sm lg:max-w-none">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <ListMusicIcon/>
                </EmptyMedia>
            </EmptyHeader>
            <EmptyTitle>
                No tracks added yet
            </EmptyTitle>
            <EmptyDescription>
                Click the "Add Tracks" to add your first track
            </EmptyDescription>
        </Empty>
    </div>
{/if}
