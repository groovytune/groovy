<script lang="ts">
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { Disc3Icon, DownloadIcon, EllipsisIcon, ListMusicIcon, MicVocalIcon, MusicIcon, PencilIcon, Share2Icon, Trash2Icon } from '@lucide/svelte';
    import { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import type { Track } from '$lib/server/prisma/browser';
    import { Button } from '$lib/components/ui/button';
    import { resolve } from '$app/paths';
    import PlayerDropdownItems from '../../player/PlayerDropdownItems.svelte';
    import ShareButton from '../ShareButton.svelte';
    import { page } from '$app/state';
    import DeleteTrackDialog from '../dialogs/DeleteTrackDialog.svelte';
    import { createUserProfileURL, type PartialUser } from '$lib/helpers/utils';

    let {
        track,
        editable = false,
        artistInfo,
        ondelete
    }: {
        track: Track;
        editable?: boolean;
        artistInfo?: PartialUser;
        ondelete?: (trackId: string) => void;
    } = $props();

    const deleteDialogState = new DialogState({ id: `delete-track-${track.id}` });
</script>

{#snippet ShareDropdownItem()}
    {#key track.id}
        <DropdownMenuItem>
            {#snippet child({ props })}
                <ShareButton
                    data={{
                        title: track.name,
                        url: new URL(resolve('/(app)/release/[releaseId]/track/[trackId]', { releaseId: track.releaseId, trackId: track.id }), page.url.origin).href
                    }}
                >
                    {#snippet child({ onclick })}
                        <a {...props} {onclick}>
                            <Share2Icon/>
                            Share
                        </a>
                    {/snippet}
                </ShareButton>
            {/snippet}
        </DropdownMenuItem>
    {/key}
{/snippet}

<DropdownMenu>
    <DropdownMenuTrigger>
        {#snippet child({ props })}
            <Button {...props} variant="ghost" size="icon">
                <EllipsisIcon/>
            </Button>
        {/snippet}
    </DropdownMenuTrigger>
    <DropdownMenuContent class="mx-2 min-w-60">
        {#if editable}
            <DropdownMenuItem>
                {#snippet child({ props })}
                    <a {...props} href={resolve('/(app)/release/[releaseId]/edit/track/[trackId]', { releaseId: track.releaseId, trackId: track.id })}>
                        <PencilIcon/>
                        Edit Info
                    </a>
                {/snippet}
            </DropdownMenuItem>
            <DropdownMenuItem>
                {#snippet child({ props })}
                    <a {...props} href={resolve('/(app)/release/[releaseId]/edit/track/[trackId]/lyrics', { releaseId: track.releaseId, trackId: track.id })}>
                        <MicVocalIcon/>
                        Edit Lyrics
                    </a>
                {/snippet}
            </DropdownMenuItem>
            <DropdownMenuSeparator/>
        {/if}
        <PlayerDropdownItems tracks={[track]}/>
        <DropdownMenuSeparator/>
        <DropdownMenuItem>
            {#snippet child({ props })}
                <a
                    {...props}
                    href={resolve(
                        '/(app)/release/[releaseId]/track/[trackId]',
                        {
                            releaseId: track.releaseId,
                            trackId: track.id
                        }
                    )}
                >
                    <MusicIcon/>
                    View Track
                </a>
            {/snippet}
        </DropdownMenuItem>
        <DropdownMenuItem class={page.route.id === '/(app)/release/[releaseId]' ? 'hidden' : ''}>
            {#snippet child({ props })}
                <a
                    {...props}
                    href={resolve(
                        '/(app)/release/[releaseId]',
                        {
                            releaseId: track.releaseId
                        }
                    )}
                >
                    <ListMusicIcon/>
                    View Release
                </a>
            {/snippet}
        </DropdownMenuItem>
        {#if artistInfo}
            <DropdownMenuItem>
                {#snippet child({ props })}
                    <a
                        {...props}
                        href={createUserProfileURL(artistInfo)}
                    >
                        <Disc3Icon/>
                        View Artist
                    </a>
                {/snippet}
            </DropdownMenuItem>
        {/if}
        {#if editable}
            <DropdownMenuSeparator/>
            <DropdownMenuItem>
                {#snippet child({ props })}
                    <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                    <a {...props} href={resolve('/(app)/api/assets/audio/[fileId]', { fileId: track.file }) + '?download'} target="_blank" rel="noopener noreferrer">
                        <DownloadIcon/>
                        Download File
                    </a>
                {/snippet}
            </DropdownMenuItem>
        {/if}
        {@render ShareDropdownItem()}
        {#if editable}
            <DropdownMenuSeparator/>
            <DropdownMenuItem class="text-destructive!" onclick={() => deleteDialogState.open()}>
                <Trash2Icon class="text-current"/>
                Delete
            </DropdownMenuItem>
        {/if}
    </DropdownMenuContent>
</DropdownMenu>

<DeleteTrackDialog
    releaseId={track.releaseId}
    tracks={[track]}
    ondelete={() => ondelete?.(track.id)}
    dialogState={deleteDialogState}
/>
