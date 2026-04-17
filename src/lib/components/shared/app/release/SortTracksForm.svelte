<script lang="ts">
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { DownloadIcon, EllipsisIcon, ListMusicIcon, LoaderIcon, PencilIcon, SaveIcon, TextAlignStartIcon, Trash2Icon } from '@lucide/svelte';
    import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '$lib/components/ui/empty';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '$lib/components/ui/item';
    import ExplicitIcon from '$lib/components/shared/ExplicitIcon.svelte';
    import { type SuperForm } from 'sveltekit-superforms';
    import { sortTracksSchema } from '$lib/schema/track';
    import { Button } from '$lib/components/ui/button';
    import { dndzone } from 'svelte-dnd-action';
    import { auth } from '$lib/client/auth';
    import { flip } from 'svelte/animate';
    import { toast } from 'svelte-sonner';
    import type z from 'zod';
    import { resolve } from '$app/paths';
    import type { Track } from '$lib/server/prisma/browser';

    let {
        releaseId,
        tracks,
        form
    }: {
        releaseId: string;
        tracks: Track[];
        form: SuperForm<z.infer<typeof sortTracksSchema>, unknown>;
    } = $props();

    // svelte-ignore state_referenced_locally
    const { form: formData, enhance, submitting, tainted } = form;
    const session = auth.useSession();

    let dndTracks = $derived($formData.tracks.toSorted((a, b) => a.position - b.position));
</script>

{#if $formData.tracks.length > 0}
    <form
        use:enhance
        method="POST"
        action={resolve('/(app)/release/[id]/tracks', { id: releaseId }) + '?/sort'}
        class="py-5 px-2.5 w-full pt-0 md:pt-5"
    >
        <div
            use:dndzone={{
                dragDisabled: $submitting || $formData.tracks.length < 2,
                items: dndTracks,
                flipDurationMs: 100,
                delayTouchStart: 500,
                dropTargetStyle: {},
            }}
            onconsider={e => dndTracks = e.detail.items.map((item, index) => ({ ...item, position: index + 1 }))}
            onfinalize={e => dndTracks = $formData.tracks = e.detail.items.map((item, index) => ({ ...item, position: index + 1 }))}
            class="grid gap-2"
        >
            {#each dndTracks as dndTrack (dndTrack.id)}
                {@const track = tracks.find(t => t.id == dndTrack.id)}
                <a
                    onclick={() => track && toast(track.name)}
                    oncontextmenu={e =>  e.preventDefault()}
                    animate:flip={{ duration: 100 }}
                    class="h-fit select-none"
                    href="#/"
                >
                    <Item class="p-2 hover:bg-secondary/50 rounded-md">
                        <ItemContent>
                            <ItemTitle
                                class="line-clamp-2 w-full"
                                style="word-wrap: break-word;"
                            >
                                <span>
                                    {track?.name ?? 'Unavailable Track'}
                                    {#if track?.explicit}
                                        <ExplicitIcon class="size-4.5"/>
                                    {/if}
                                </span>
                            </ItemTitle>
                            <ItemDescription>
                                {$session.data?.user.name || 'Unknown Artist'}
                            </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    {#snippet child({ props })}
                                        <Button {...props} variant="ghost" size="icon">
                                            <EllipsisIcon/>
                                        </Button>
                                    {/snippet}
                                </DropdownMenuTrigger>
                                <DropdownMenuContent class="mx-2 min-w-40">
                                    {#if track}
                                        <DropdownMenuItem>
                                            {#snippet child({ props })}
                                                <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                                                <a {...props} href={resolve('/(app)/api/track/[id]/download', { id: track.id })} target="_blank" rel="noopener noreferrer">
                                                    <DownloadIcon/>
                                                    Download File
                                                </a>
                                            {/snippet}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator/>
                                    {/if}
                                    <DropdownMenuItem>
                                        <PencilIcon/>
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <TextAlignStartIcon/>
                                        Edit Lyrics
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem class="text-destructive!">
                                        <Trash2Icon class="text-current"/>
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </ItemActions>
                    </Item>
                </a>
            {/each}
        </div>
        {#if $tainted}
            <div class="flex justify-center sm:justify-end py-5 pb-0">
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
            </div>
        {/if}
        <div class="text-center pt-5">
            <p class="text-xs text-muted-foreground">
                {$formData.tracks.length} track{$formData.tracks.length !== 1 ? 's' : ''} • Drag and drop to reorder
            </p>
        </div>
    </form>
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
