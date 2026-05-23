<script lang="ts">
    import { zod4Client } from 'sveltekit-superforms/adapters';
    import { newPostSchema } from '$lib/schema/post';
    import { superForm, type SuperForm, type SuperValidated } from 'sveltekit-superforms';
    import { toast } from 'svelte-sonner';
    import type z from 'zod';
    import type { Snippet } from 'svelte';
    import { resolve } from '$app/paths';
    import type { Post } from '$lib/server/prisma/browser';
    import { goto } from '$app/navigation';

    let {
        form = $bindable(null),
        data,
        redirect = true,
        children
    }: {
        form?: SuperForm<z.infer<typeof newPostSchema>>|null;
        data?: SuperValidated<z.infer<typeof newPostSchema>>;
        redirect?: boolean;
        children?: Snippet<[{
            form: SuperForm<z.infer<typeof newPostSchema>>;
        }]>;
    } = $props();

    // svelte-ignore state_referenced_locally
    form = superForm(data ?? { content: '' }, {
        validators: zod4Client(newPostSchema),
        validationMethod: 'auto',
        invalidateAll: false,
        resetForm: false,
        dataType: 'json',
        onError: event => {
            console.error('Form submission error:', event.result);
            toast.error(event.result.error.message);
        },
        onResult: event => {
            const { type } = event.result;

            if (type === 'failure') {
                console.error('Upload form submission failed:', event.result);
                const errors: string|undefined = event.result.data?.form.errors?.files?._errors?.join('\n');

                toast.error(errors ?? event.result.data?.message ?? 'Failed to upload tracks.');
                return;
            }

            if (type != 'success') return;

            const message = event.result.data?.form.message;
            const post = message.post as Post;

            toast.success(message.message);

            if (redirect) {
                goto(resolve('/(app)/post/[postId]', { postId: post.id }));
            }
        }
    });

    const { enhance } = form;
</script>

<form
    use:enhance
    action={resolve('/(app)/post') + '?/upload'}
    method="POST"
    encType="multipart/form-data"
>
    {@render children?.({ form })}
</form>
