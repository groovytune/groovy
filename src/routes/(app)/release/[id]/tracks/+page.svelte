<script lang="ts">
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';
    import { CirclePlusIcon, EllipsisIcon, LoaderIcon, PencilIcon, PlayIcon, Trash2Icon } from '@lucide/svelte';
    import SortTracksForm from '$lib/components/shared/app/release/SortTracksForm.svelte';
    import UploadTracksForm from '$lib/components/shared/app/release/UploadTracksForm.svelte';
    import { sortTracksSchema, uploadTracksSchema } from '$lib/schema/track.js';
    import ExplicitIcon from '$lib/components/shared/ExplicitIcon.svelte';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio';
    import { zod4Client } from 'sveltekit-superforms/adapters';
    import { Button } from '$lib/components/ui/button';
    import { superForm } from 'sveltekit-superforms';
    import { auth } from '$lib/client/auth.js';
    import { toast } from 'svelte-sonner';
    import type { Track } from '$lib/server/prisma/browser.js';
 
    let { data } = $props();

    let tracks = $derived(data.release.tracks);

    // svelte-ignore state_referenced_locally
    const sortTracksForm = superForm(data.sortTracksForm, {
        validators: zod4Client(sortTracksSchema),
        dataType: 'json',
        taintedMessage: true,
        invalidateAll: false,
        resetForm: false,
        onError: event => {
            console.error('Form submission error:', event.result);
            toast.error(event.result.error.message);
        },
        onSubmit: () => {
            console.log('Updating track order...', $sortFormData.tracks);
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

            console.log('Updated track order:', newTracks);
            toast.success(message.message ?? `Updated track order for ${newTracks.length} track${newTracks.length > 1 ? 's' : ''}`);

            sortTracksForm.form.update(
                f => {
                    f.tracks = newTracks.sort((a, b) => a.position - b.position);
                    return f;
                },
                { taint: false }
            );
        }
    });

    const { form: sortFormData } = sortTracksForm;

    // svelte-ignore state_referenced_locally
    const trackUploadForm = superForm(data.uploadTracksForm, {
        validators: zod4Client(uploadTracksSchema),
        invalidateAll: false,
        resetForm: false,
        dataType: 'json',
        onError: event => {
            console.error('Form submission error:', event.result);
            toast.error(event.result.error.message);
        },
        onSubmit: () => {
            console.log('Uploading tracks...', $uploadFormData);
        },
        onResult: event => {
            const { type } = event.result;

            if (type === 'failure') {
                console.error('Upload form submission failed:', event.result);
                toast.error(event.result.data?.message ?? 'Failed to upload tracks.');
                return;
            }

            if (type != 'success') return;

            const message = event.result.data?.form.message;

            if (message.invalid?.length) {
                const invalidFiles = message.invalid.map((i: { file: File }) => i.file.name).join(', ');
                toast.error(`Some files were invalid: ${invalidFiles}`);
            }


            const newTracks = (message.tracks ?? []) as Track[];
            const invalid = message.invalid as { file: File; reason: string }[];

            console.log(event.result);

            toast.success(message.message ?? `Uploaded ${newTracks.length} track${newTracks.length > 1 ? 's' : ''}.`);

            if (invalid?.length) {
                const invalidFiles = invalid.map(i => i.file.name).join(', ');
                toast.error(`Some files were invalid: ${invalidFiles}`);
            }

            tracks.push(...newTracks);

            sortTracksForm.form.update(
                f => {
                    f.tracks = [
                        ...f.tracks,
                        ...newTracks.map(t => ({ id: t.id, position: t.position }))
                    ].sort((a, b) => a.position - b.position);

                    return f;
                },
                { taint: false }
            );
        }
    });

    const { form: uploadFormData } = trackUploadForm;

    const session = auth.useSession();
</script>

<div class="w-full flex md:flex-row flex-col">
    <side class="size-full flex flex-col items-center md:max-w-96 pb-5">
        <div class="p-5 w-full max-w-sm relative">
            <AspectRatio class="w-full rounded-md bg-muted">
                <img src={data.release.cover} alt="Release Cover" class="size-full object-cover rounded-md"/>
                <img src={data.release.cover} alt="Release Cover" class="size-full object-cover absolute -z-10 top-0 left-0 opacity-50 saturate-150 blur-2xl"/>
            </AspectRatio>
        </div>
        <header class="w-full max-w-sm text-center px-5">
            <h1
                class="text-2xl leading-tight font-semibold line-clamp-3"
                style="word-wrap: break-word;"
            >
                {data.release.name}
                {#if data.release.explicit}
                    <ExplicitIcon/>
                {/if}
            </h1>
            <p class="text-sm leading-tight text-muted-foreground">
                {$session.data?.user.name || 'Unknown Artist'}
            </p>
            <p
                class="text-xs leading-tight text-muted-foreground/60 line-clamp-2 hover:line-clamp-none mt-2"
                style="word-wrap: break-word;"
                title={data.release.description}
            >
                {data.release.description || ''}
            </p>
            <div class="flex gap-2 justify-center my-5 max-w-sm px-20">
                <Button variant="outline" size="icon">
                    <PlayIcon/>
                </Button>
                <UploadTracksForm releaseId={data.release.id} form={trackUploadForm}>
                    {#snippet children({ input, disabled, submitting })}
                        <Button
                            class="w-full"
                            onclick={() => input?.click()}
                            disabled={disabled}
                        >
                            {#if submitting}
                                <LoaderIcon class="animate-spin"/>
                                    Uploading...
                            {:else}
                                <CirclePlusIcon/>
                                Add Tracks
                            {/if}
                        </Button>
                    {/snippet}
                </UploadTracksForm>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        {#snippet child({ props })}
                            <Button {...props} variant="outline" size="icon">
                                <EllipsisIcon/>
                            </Button>
                        {/snippet}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent class="mx-2">
                        <DropdownMenuItem>
                            <PencilIcon/>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem class="text-destructive!">
                            <Trash2Icon class="text-current"/>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    </side>
    <SortTracksForm {tracks} releaseId={data.release.id} form={sortTracksForm}/>
</div>
