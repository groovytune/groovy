<script lang="ts">
    import { fileProxy, type SuperForm } from 'sveltekit-superforms';
    import type z from 'zod';
    import { newReleaseSchema, type editReleaseSchema } from '$lib/schema/release';
    import type { ClassValue } from 'tailwind-variants';
    import { Disc3Icon, EyeOffIcon, Icon, ListMusicIcon, LockIcon, MusicIcon, UsersIcon } from '@lucide/svelte';
    import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '$lib/components/ui/item';
    import { cn } from '$lib/helpers/utils';
    import { FormControl, FormField, FormFieldErrors, FormLabel } from '$lib/components/ui/form';
    import { Input } from '$lib/components/ui/input';
    import { Textarea } from '$lib/components/ui/textarea';
    import FileInput from '$lib/components/shared/FileInput.svelte';
    import ExplicitIcon from '$lib/components/shared/ExplicitIcon.svelte';
    import { Switch } from '$lib/components/ui/switch';
    import GenreSearchInput from '$lib/components/shared/app/release/GenreSearchInput.svelte';

    let {
        form,
        disabled = false,
        coverInput = $bindable(null),
        nameInput = $bindable(null)
    }: {
        form: SuperForm<z.infer<typeof newReleaseSchema|typeof editReleaseSchema>>;
        disabled?: boolean;
        coverInput: HTMLInputElement|null;
        nameInput: HTMLInputElement|null;
    } = $props();

    // svelte-ignore state_referenced_locally
    const { form: formData, submitting } = form;

    // svelte-ignore state_referenced_locally
    const cover = fileProxy(form, 'cover', { empty: 'undefined' });
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
            <a
                {...itemProps}
                {...props}
                onclick={!disabled ? onclick : undefined}
                href="#/"
            >
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
                    <ItemDescription class="line-clamp-3" title={description}>
                        {description}
                    </ItemDescription>
                </ItemContent>
            </a>
        {/snippet}
    </Item>
{/snippet}

<FormField {form} name="name">
    <FormControl>
        {#snippet children({ props })}
            <FormLabel>Name</FormLabel>
            <Input
                {...props}
                bind:value={$formData.name}
                bind:ref={nameInput}
                disabled={$submitting || disabled}
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
                disabled={$submitting || disabled}
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
                disabled={$submitting || disabled}
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
                        <ItemMedia variant="icon">
                            <ExplicitIcon class="leading-3.5! mb-0"/>
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>
                                Mark this release as explicit
                            </ItemTitle>
                            <ItemDescription class={$formData.explicit ? "line-clamp-none" : "line-clamp-3"}>
                                Explicit content may include strong language, sexual content, or violence. Marking your release as explicit helps ensure it is properly labeled and filtered on platforms that support content warnings.
                            </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Switch
                                {...props}
                                bind:checked={$formData.explicit}
                                disabled={$submitting || disabled}
                            />
                        </ItemActions>
                    </FormLabel>
                {/snippet}
            </Item>
        {/snippet}
    </FormControl>
    <FormFieldErrors/>
</FormField>
<FormField {form} name="genres">
    <FormControl>
        {#snippet children({ props })}
            <FormLabel class="text-lg">Genres</FormLabel>
            <GenreSearchInput
                {...props}
                bind:value={$formData.genres}
                disabled={$submitting || disabled}
                placeholder="Search and add genres to your release"
            />
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
                    class: "cursor-pointer lg:w-1/3",
                    props,
                    disabled: $submitting || disabled,
                    active: $formData.type === 'ALBUM',
                    onclick: () => $formData.type = 'ALBUM'
                })}
                {@render ItemSelect({
                    icon: MusicIcon,
                    title: 'Single',
                    description: 'A release that typically features one main track, often accompanied by additional tracks such as remixes or B-sides.',
                    class: "cursor-pointer lg:w-1/3",
                    props,
                    disabled: $submitting || disabled,
                    active: $formData.type === 'SINGLE',
                    onclick: () => $formData.type = 'SINGLE'
                })}
                {@render ItemSelect({
                    icon: ListMusicIcon,
                    title: 'EP',
                    description: 'A release that contains a few tracks, typically more than a single but fewer than an album.',
                    class: "cursor-pointer lg:w-1/3",
                    props,
                    disabled: $submitting || disabled,
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
                    class: "cursor-pointer lg:w-1/3",
                    props,
                    disabled: $submitting || disabled,
                    active: $formData.privacy === 'PUBLIC',
                    onclick: () => $formData.privacy = 'PUBLIC'
                })}
                {@render ItemSelect({
                    icon: LockIcon,
                    title: 'Private',
                    description: 'Your release will only be visible to you. It will not be discoverable on the platform.',
                    class: "cursor-pointer lg:w-1/3",
                    props,
                    disabled: $submitting || disabled,
                    active: $formData.privacy === 'PRIVATE',
                    onclick: () => $formData.privacy = 'PRIVATE'
                })}
                {@render ItemSelect({
                    icon: EyeOffIcon,
                    title: 'Unlisted',
                    description: 'Your release will not be visible on your profile or in search results, but anyone with the direct link can view it.',
                    class: "cursor-pointer lg:w-1/3",
                    props,
                    disabled: $submitting || disabled,
                    active: $formData.privacy === 'UNLISTED',
                    onclick: () => $formData.privacy = 'UNLISTED'
                })}
            </div>
        {/snippet}
    </FormControl>
    <FormFieldErrors/>
</FormField>
