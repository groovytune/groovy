<script lang="ts">
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Field, FieldDescription, FieldGroup } from '$lib/components/ui/field';
    import { Button } from '$lib/components/ui/button';
    import { SiDiscord, SiGoogle } from '@icons-pack/svelte-simple-icons';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import type { SocialProvider } from 'better-auth';
    import { toast } from 'svelte-sonner';
    import { auth } from '$lib/client/auth';

    let redirect = $derived(page.url.searchParams.get('redirect') ?? '/');

    async function signInWrapper(provider: SocialProvider) {
        const { error } = await auth.signIn.social({
            provider,
            callbackURL: redirect,
            fetchOptions: {
                credentials: 'include'
            }
        });

        if (error) {
            toast.error(error.message ?? error.statusText);
            return;
        }
    }
</script>

<Card>
    <CardHeader class="text-center">
        <CardTitle class="text-xl">Welcome</CardTitle>
        <CardDescription>Login with your social account to continue</CardDescription>
    </CardHeader>
    <CardContent>
        <FieldGroup>
            <Field>
                <Button
                    variant="outline"
                    type="button"
                    onclick={() => signInWrapper('google')}
                >
                    <SiGoogle/>
                    Sign In with Google
                </Button>
                <Button
                    variant="outline"
                    type="button"
                    onclick={() => signInWrapper('discord')}
                >
                    <SiDiscord/>
                    Sign In with Discord
                </Button>
            </Field>
        </FieldGroup>
    </CardContent>
    <CardFooter>
        <FieldDescription class="px-6 text-center text-xs">
            By signing in, you agree to our <a href={resolve('/(resource)/terms')}>Terms of Service</a> and <a href={resolve('/(resource)/privacy')}>Privacy Policy</a>.
        </FieldDescription>
    </CardFooter>
</Card>
