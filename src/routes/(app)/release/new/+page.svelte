<script lang="ts">
    import { superForm } from 'sveltekit-superforms';
    import { zod4Client } from 'sveltekit-superforms/adapters';
    import { newReleaseSchema } from '$lib/schema/release.js';
    import { Button } from '$lib/components/ui/button/index.js';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio/index.js';
    import { auth } from '$lib/client/auth.js';
    import ExplicitIcon from '$lib/components/shared/icons/ExplicitIcon.svelte';
    import { LoaderIcon } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';
    import placeholderCover from '$lib/assets/cover.webp';
    import { resolve } from '$app/paths';
    import ReleaseFormFields from '$lib/components/shared/app/release/forms/fields/ReleaseFormFields.svelte';
    import { ActiveNavigationPageContext } from '$lib/contexts/navigation.js';

    let { data } = $props();

    const activeNavigationPage = ActiveNavigationPageContext.get();

    activeNavigationPage.id = 'create';

    // svelte-ignore state_referenced_locally
    const form = superForm(data.form, {
        validators: zod4Client(newReleaseSchema),
        clearOnSubmit: 'errors-and-message',
        dataType: 'json',
        autoFocusOnError: true,
        validationMethod: 'auto',
        taintedMessage: true,
        onError: event => {
            console.error('Form submission error:', event.result);
            toast.error(event.result.error.message);
        },
        onResult: event => {
            const { type } = event.result;

            if (type === 'failure') {
                console.error('Form submission failed:', event.result);
                toast.error(event.result.data?.message ?? 'Failed to create release.');
                return;
            }

            if (type != 'success') return;

            const message = event.result.data?.form.message;
            toast.success(message ?? 'Release created successfully!');
        }
    });

    const { form: formData, enhance, submitting, allErrors, capture, restore } = form;

    const session = auth.useSession();

    let coverInput: HTMLInputElement|null = $state(null);
    let nameInput: HTMLInputElement|null = $state(null);
    let coverURL = $derived($formData.cover ? URL.createObjectURL($formData.cover) : placeholderCover);

    export const snapshot = { capture, restore };
</script>

<div class="flex flex-col md:flex-row">
    <section class="w-full shrink-0 flex flex-col items-center md:max-w-sm">
        <div class="p-5 w-full max-w-sm relative">
            <AspectRatio
                class="w-full rounded-md bg-muted cursor-pointer"
                onclick={() => coverInput?.click()}
            >
                <img src={coverURL} alt="Release Cover" class="size-full object-cover rounded-md"/>
                <img src={coverURL} alt="Release Cover" class="size-full object-cover absolute -z-10 top-0 left-0 opacity-50 saturate-150 blur-2xl"/>
            </AspectRatio>
        </div>
        <header class="w-full max-w-sm text-center px-5">
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <h1
                class="text-2xl leading-tight font-semibold line-clamp-3"
                style="word-wrap: break-word;"
                onclick={() => nameInput?.focus()}
            >
                {$formData.name || 'New Release'}
                {#if $formData.explicit}
                    <ExplicitIcon/>
                {/if}
            </h1>
            <p class="text-sm leading-tight text-muted-foreground">
                {$session.data?.user.name || 'Unknown Artist'}
            </p>
            <p
                class="text-xs leading-tight text-muted-foreground/60 line-clamp-2 hover:line-clamp-none mt-2"
                style="word-wrap: break-word;"
                title={$formData.description}
            >
                {$formData.description || ''}
            </p>
        </header>
    </section>
    <form
        class="w-full md:max-w-[calc(100%-24rem)] p-5 flex flex-col gap-2"
        action={resolve('/(app)/release/new')}
        method="POST"
        enctype="multipart/form-data"
        use:enhance
    >
        <ReleaseFormFields {form} bind:coverInput bind:nameInput/>
        <div class="flex justify-end">
            <Button type="submit" disabled={$submitting} aria-busy={$submitting} aria-disabled={$submitting || !!$allErrors.length}>
                {#if $submitting}
                    <LoaderIcon class="animate-spin"/>
                {/if}
                Submit
            </Button>
        </div>
    </form>
</div>
