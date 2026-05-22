<script lang="ts">
    import { DialogState } from '$lib/helpers/classes/DialogState.svelte';
    import type { Snippet } from 'svelte';
    import { Button } from '$lib/components/ui/button';
    import ResponsiveDialog from '../../ResponsiveDialog.svelte';
    import { SiBluesky, SiFacebook, SiReddit, SiTelegram, SiWhatsapp, SiX } from '@icons-pack/svelte-simple-icons';
    import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '$lib/components/ui/input-group';
    import { CopyIcon, Link2Icon } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';

    let {
        data,
        child
    }: {
        data: ShareData;
        child?: Snippet<[props: { onclick: () => void; data: ShareData; }]>;
    } = $props();

    let shareDialogState = new DialogState({
        id: 'share-dialog'
    });

    let sharedTitle = $derived(data.title ?? '');
    let sharedText = $derived(data.text ?? '');
    let sharedURL = $derived(data.url ?? '');

    async function onShare() {
        if ('canShare' in navigator && 'share' in navigator && navigator.canShare(data)) {
            await navigator.share(data);
            return;
        }

        shareDialogState.open();
    }

    async function onCopyLink() {
        if (!('navigator' in window) || !('clipboard' in navigator)) return;

        await navigator.clipboard.writeText(sharedURL);
        toast.success('Link copied to clipboard!');
    }
</script>

{#if child}
    {@render child({ onclick: onShare, data })}
{:else}
    <Button onclick={onShare}>
        Share
    </Button>
{/if}

<ResponsiveDialog dialogState={shareDialogState}>
    {#snippet title()}
        {sharedTitle || 'Share'}
    {/snippet}
    {#snippet description()}
        Share this on your favorite social media platform!
    {/snippet}
    {#snippet content({ type })}
        <div class:px-4={type === 'drawer'} class="py-2 grid gap-2">
            <div class="flex items-center gap-2 min-[400px]:justify-start justify-between">
                <Button size="icon" class="bg-blue-500!" href="https://www.facebook.com/sharer/sharer.php?u={encodeURIComponent(sharedURL)}" target="_blank">
                    <SiFacebook/>
                </Button>
                <Button size="icon" class="bg-black!" href="https://twitter.com/intent/tweet?text={encodeURIComponent(sharedText)}&url={encodeURIComponent(sharedURL)}" target="_blank">
                    <SiX/>
                </Button>
                <Button size="icon" class="bg-blue-400!" href="https://bsky.app/intent/compose?text={encodeURIComponent(sharedText)}&url={encodeURIComponent(sharedURL)}" target="_blank">
                    <SiBluesky/>
                </Button>
                <Button size="icon" class="bg-[#0088cc]!" href="https://t.me/share/url?text={encodeURIComponent(sharedText)}&url={encodeURIComponent(sharedURL)}" target="_blank">
                    <SiTelegram/>
                </Button>
                <Button size="icon" class="bg-green-500!" href="https://wa.me/?text={encodeURIComponent(sharedText + ' ' + sharedURL)}" target="_blank">
                    <SiWhatsapp/>
                </Button>
                <Button size="icon" class="bg-[#ff4500]!" href="https://www.reddit.com/submit?url={encodeURIComponent(sharedURL)}&title={encodeURIComponent(sharedTitle)}" target="_blank">
                    <SiReddit/>
                </Button>
            </div>
            <div class="py-2 flex flex-col gap-2">
                <p class="text-sm text-muted-foreground">
                    Copy the link below to share:
                </p>
                <InputGroup>
                    <InputGroupAddon>
                        <Link2Icon/>
                    </InputGroupAddon>
                    <InputGroupInput value={sharedURL} readonly/>
                    {#if 'clipboard' in navigator}
                        <InputGroupButton variant="ghost" size="icon-sm" onclick={onCopyLink}>
                            <CopyIcon/>
                        </InputGroupButton>
                    {/if}
                </InputGroup>
            </div>
        </div>
    {/snippet}
    {#snippet actions()}
        <Button onclick={() => shareDialogState.close()}>
            Close
        </Button>
    {/snippet}
</ResponsiveDialog>
