<script lang="ts">
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Field, FieldGroup } from '$lib/components/ui/field';
    import { Button } from '$lib/components/ui/button';
    import { toast } from 'svelte-sonner';
    import { goto } from '$app/navigation';
    import { DoorOpenIcon, LoaderIcon, SquareXIcon } from '@lucide/svelte';
    import { page } from '$app/state';
    import { auth } from '../../../lib/client/auth';

    let signingOut = $state(false);
    let redirect = $derived(page.url.searchParams.get('redirect'));

    async function signOutWrapper() {
        signingOut = true;

        const { data, error } = await auth.signOut();

        signingOut = false;

        if (error) {
            toast.error(error.message ?? error.statusText);
            return;
        }

        if (data.success) {
            toast.success('Successfully signed out');
            // eslint-disable-next-line svelte/no-navigation-without-resolve
            goto(redirect ?? '/');
            return;
        }

        toast.error('Failed to sign out');
    }
</script>

<Card>
    <CardHeader class="text-center">
        <CardTitle class="text-xl">
            Sign Out
        </CardTitle>
        <CardDescription>Would you like to sign out?</CardDescription>
    </CardHeader>
    <CardContent>
        <FieldGroup>
            <Field>
                <Button
                    variant="outline"
                    type="button"
                    disabled={signingOut}
                    onclick={() => signOutWrapper()}
                >
                    {#if signingOut}
                        <LoaderIcon class="animate-spin"/>
                    {:else}
                        <DoorOpenIcon/>
                    {/if}
                    <span>Sign Out</span>
                </Button>
                <Button
                    variant="outline"
                    type="button"
                    disabled={signingOut}
                    // eslint-disable-next-line svelte/no-navigation-without-resolve
                    onclick={() => goto('/')}
                >
                    <SquareXIcon/>
                    Nevermind
                </Button>
            </Field>
        </FieldGroup>
    </CardContent>
</Card>
