<script lang="ts">
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
    import { Drawer, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '$lib/components/ui/drawer';
    import { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import { DrawerContent } from '$lib/components/ui/drawer/index.js';
    import type { DrawerContentProps } from 'vaul-svelte';
    import type { DialogContentProps } from 'bits-ui';
    import { MediaQuery } from 'svelte/reactivity';
    import { type Snippet } from 'svelte';

    let {
        content,
        footer,
        title,
        description,
        drawerDirection = 'bottom',
        minWidth = `639px`,
        dialogState = new DialogState(),
        ...props
    }: {
        content?: Snippet<[{ type: 'dialog'|'drawer' }]>;
        footer?: Snippet<[{ type: 'dialog'|'drawer' }]>;
        title?: Snippet<[{ type: 'dialog'|'drawer' }]>;
        description?: Snippet<[{ type: 'dialog'|'drawer' }]>;
        drawerDirection?: 'left'|'right'|'top'|'bottom';
        minWidth?: string;
        dialogState?: DialogState;
        dialogContentProps?: DialogContentProps;
        drawerContentProps?: DrawerContentProps;
        [key: string]: any;
    } = $props();

    let isDesktop: MediaQuery = $state()!;
    let isDialogOpen = $derived(!!isDesktop?.current && dialogState.isOpen);
    let isDrawerOpen = $derived(!isDesktop?.current && dialogState.isOpen);

    $effect(() => {
        isDesktop = new MediaQuery(`(min-width: ${minWidth})`);
    });

    $effect(() => {
        if (dialogState.isOpen !== dialogState.isActive) dialogState.toggle(dialogState.isActive);
    });
</script>



<Dialog bind:open={() => isDialogOpen, dialogState.toggle}>
    <DialogContent {...props.dialogContentProps}>
        {#if title || description}
            <DialogHeader class="text-start">
                {#if title}<DialogTitle>{@render title({ type: 'dialog' })}</DialogTitle>{/if}
                {#if description}<DialogDescription>{@render description({ type: 'dialog' })}</DialogDescription>{/if}
            </DialogHeader>
        {/if}
        {@render content?.({ type: 'dialog' })}
        {#if footer}
            <DialogFooter>{@render footer({ type: 'dialog' })}</DialogFooter>
        {/if}
    </DialogContent>
</Dialog>
<Drawer bind:open={() => isDrawerOpen, dialogState.toggle} direction={drawerDirection}>
    <DrawerContent {...props.drawerContentProps}>
        {#if title || description}
            <DrawerHeader>
                {#if title}<DrawerTitle>{@render title({ type: 'drawer' })}</DrawerTitle>{/if}
                {#if description}<DrawerDescription>{@render description({ type: 'drawer' })}</DrawerDescription>{/if}
            </DrawerHeader>
        {/if}
        {@render content?.({ type: 'drawer' })}
        {#if footer}
            <DrawerFooter>{@render footer({ type: 'drawer' })}</DrawerFooter>
        {/if}
        <style>
            html,
            body {
                overscroll-behavior-y: contain;
            }
        </style>
    </DrawerContent>
</Drawer>
