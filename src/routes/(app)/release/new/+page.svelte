<script lang="ts">
    import { fileProxy, superForm } from 'sveltekit-superforms';
    import { zod4 } from 'sveltekit-superforms/adapters';
    import { newReleaseSchema } from '$lib/schema/release.js';
    import { FormControl, FormField, FormFieldErrors, FormLabel } from '$lib/components/ui/form/index.js';
    import { Input } from '$lib/components/ui/input/index.js';
    import { Textarea } from '$lib/components/ui/textarea/index.js';
    import { Button } from '$lib/components/ui/button/index.js';
    import FileInput from '$lib/components/shared/FileInput.svelte';
    import { AspectRatio } from '$lib/components/ui/aspect-ratio/index.js';
    import { auth } from '$lib/client/auth.js';
    import ExplicitIcon from '$lib/components/shared/ExplicitIcon.svelte';
    import { Switch } from '$lib/components/ui/switch';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '$lib/components/ui/item';
    import { Disc3Icon, ListMusicIcon, MusicIcon, Icon, UsersIcon, LockIcon, EyeOffIcon } from '@lucide/svelte';
    import { cn } from '$lib/helpers/utils';
    import type { ClassValue } from 'tailwind-variants';

    let { data } = $props();

    const form = superForm(data.form, {
        validators: zod4(newReleaseSchema),
        clearOnSubmit: 'errors-and-message',
        autoFocusOnError: true,
        validationMethod: 'auto',
        taintedMessage: true
    });

    const { form: formData, enhance, submitting, allErrors } = form;

    const session = auth.useSession();
    const cover = fileProxy(form, 'cover', {
        empty: 'undefined'
    });

    let coverInput: HTMLInputElement|null = $state(null);
    let nameInput: HTMLInputElement|null = $state(null);
</script>

{#snippet ItemSelect({
    icon,
    title,
    description,
    active,
    disabled,
    onclick,
    class: className,
    ...props
}: {
    icon?: typeof Icon;
    title: string;
    description: string;
    active?: boolean;
    disabled?: boolean;
    onclick?: () => void;
    class?: ClassValue;
    [key: string]: unknown;
})}
    <Item
        {...props}
        variant={disabled ? "muted" : "outline"}
        class={cn(
            active ? "border-primary" : "",
            className,
            disabled ? "cursor-not-allowed opacity-50" : ""
        )}
    >
        {#snippet child({ props: itemProps })}
            <a href="#/" {...itemProps} {...props} onclick={!disabled ? onclick : undefined}>
                {#if icon}
                    {@const Icon = icon}
                    <ItemMedia variant="icon" class={active ? "text-primary bg-primary/10 border-primary/50" : ""}>
                        <Icon/>
                    </ItemMedia>
                {/if}
                <ItemContent>
                    <ItemTitle class={active ? "text-primary" : ""}>
                        {title}
                    </ItemTitle>
                    <ItemDescription class="line-clamp-3">
                        {description}
                    </ItemDescription>
                </ItemContent>
            </a>
        {/snippet}
    </Item>
{/snippet}

<div class="flex flex-col md:flex-row">
    <section class="w-full flex flex-col items-center md:max-w-sm">
        <div class="p-5 w-full max-w-sm relative">
            {#key $formData.cover}
                {@const url = $formData.cover ? URL.createObjectURL($formData.cover) : null}
                <AspectRatio
                    class="w-full rounded-md bg-muted cursor-pointer"
                    onclick={() => coverInput?.click()}
                >
                    <img src={url} alt=" " class="size-full object-cover rounded-md"/>
                    <img src={url} alt=" " class="size-full object-cover absolute -z-10 top-0 left-0 opacity-50 saturate-150 blur-2xl"/>
                </AspectRatio>
            {/key}
        </div>
        <div class="w-full max-w-sm text-center px-5">
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
            <p
                class="text-sm leading-tight text-muted-foreground"
            >
                {$session.data?.user.name}
            </p>
            <p class="text-xs leading-tight text-muted-foreground/60 line-clamp-2" style="word-wrap: break-word;">
                {$formData.description || ''}
            </p>
        </div>
    </section>
    <form class="w-full p-5 grid gap-2" method="POST" enctype="multipart/form-data" use:enhance>
        <FormField {form} name="name">
            <FormControl>
                {#snippet children({ props })}
                    <FormLabel>Name</FormLabel>
                    <Input
                        {...props}
                        bind:value={$formData.name}
                        bind:ref={nameInput}
                        placeholder="Release Name"
                    />
                {/snippet}
            </FormControl>
            <FormFieldErrors/>
        </FormField>
        <FormField {form} name="description">
            <FormControl>
                {#snippet children({ props })}
                    <FormLabel>Description</FormLabel>
                    <Textarea
                        {...props}
                        bind:value={$formData.description}
                        placeholder="Release Description"
                    />
                {/snippet}
            </FormControl>
            <FormFieldErrors/>
        </FormField>
        <FormField {form} name="cover">
            <FormControl>
                {#snippet children({ props })}
                    <FormLabel>Cover Image</FormLabel>
                    <FileInput
                        {...props}
                        bind:files={$cover}
                        bind:ref={coverInput}
                        accept="image/*"
                    />
                {/snippet}
            </FormControl>
            <FormFieldErrors/>
        </FormField>
        <FormField {form} name="explicit">
            <FormControl>
                {#snippet children({ props })}
                    <Item variant="outline">
                        {#snippet child({ props: itemProps })}
                            <FormLabel {...itemProps}>
                                <ItemMedia variant="icon" class={$formData.explicit ? "text-red-500" : "text-muted-foreground"}>
                                    <ExplicitIcon class="leading-3.5! mb-0"/>
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>
                                        Mark this release as explicit
                                    </ItemTitle>
                                    <ItemDescription>
                                        Explicit content may include strong language, sexual content, or violence. Marking your release as explicit helps ensure it is properly labeled and filtered on platforms that support content warnings.
                                    </ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <Switch
                                        {...props}
                                        bind:checked={$formData.explicit}
                                    />
                                </ItemActions>
                            </FormLabel>
                        {/snippet}
                    </Item>
                {/snippet}
            </FormControl>
            <FormFieldErrors/>
        </FormField>
        <FormField {form} name="type">
            <FormControl>
                {#snippet children({ props })}
                    <FormLabel class="text-lg">Release Type</FormLabel>
                    <div class="flex gap-2 flex-col lg:flex-row">
                        {@render ItemSelect({
                            icon: Disc3Icon,
                            title: 'Album',
                            description: 'A collection of tracks that are released together as a cohesive unit.',
                            class: "cursor-pointer w-1/3",
                            props,
                            active: $formData.type === 'ALBUM',
                            onclick: () => $formData.type = 'ALBUM'
                        })}
                        {@render ItemSelect({
                            icon: MusicIcon,
                            title: 'Single',
                            description: 'A release that typically features one main track, often accompanied by additional tracks such as remixes or B-sides.',
                            class: "cursor-pointer w-1/3",
                            props,
                            active: $formData.type === 'SINGLE',
                            onclick: () => $formData.type = 'SINGLE'
                        })}
                        {@render ItemSelect({
                            icon: ListMusicIcon,
                            title: 'EP',
                            description: 'A release that contains a few tracks, typically more than a single but fewer than an album.',
                            class: "cursor-pointer w-1/3",
                            props,
                            active: $formData.type === 'EP',
                            onclick: () => $formData.type = 'EP'
                        })}
                    </div>
                {/snippet}
            </FormControl>
            <FormFieldErrors/>
        </FormField>
        <FormField {form} name="privacy">
            <FormControl>
                {#snippet children({ props })}
                    <FormLabel class="text-lg">Privacy</FormLabel>
                    <div class="flex gap-2 flex-col lg:flex-row">
                        {@render ItemSelect({
                            icon: UsersIcon,
                            title: 'Public',
                            description: 'Your release will be visible to everyone and can be shared on social media and other platforms.',
                            class: "cursor-pointer w-1/3",
                            props,
                            active: $formData.privacy === 'PUBLIC',
                            onclick: () => $formData.privacy = 'PUBLIC'
                        })}
                        {@render ItemSelect({
                            icon: LockIcon,
                            title: 'Private',
                            description: 'Your release will only be visible to you. It will not be discoverable on the platform.',
                            class: "cursor-pointer w-1/3",
                            props,
                            active: $formData.privacy === 'PRIVATE',
                            onclick: () => $formData.privacy = 'PRIVATE'
                        })}
                        {@render ItemSelect({
                            icon: EyeOffIcon,
                            title: 'Unlisted',
                            description: 'Your release will not be visible on your profile or in search results, but anyone with the direct link can view it.',
                            class: "cursor-pointer w-1/3",
                            props,
                            active: $formData.privacy === 'UNLISTED',
                            onclick: () => $formData.privacy = 'UNLISTED'
                        })}
                    </div>
                {/snippet}
            </FormControl>
            <FormFieldErrors/>
        </FormField>
        <div>
            <Button type="submit" disabled={$submitting || !!$allErrors.length}>
                Submit
            </Button>
        </div>
    </form>
</div>
