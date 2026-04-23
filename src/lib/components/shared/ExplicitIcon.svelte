<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { cn } from '$lib/helpers/utils';
    import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
    import { categoryInfos } from '../../helpers/constants';

    let props: HTMLAttributes<SVGSVGElement> = $props();
</script>

<Tooltip>
    <TooltipTrigger>
        {#snippet child({ props: tooltipProps })}
            <svg
                {...tooltipProps}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                {...props}
                class={cn("inline-block mb-1", props.class)}
            >
                <path fill="currentColor" d="M9 17h6v-2h-4v-2h4v-2h-4V9h4V7H9zm-4 4q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21z" />
            </svg>
        {/snippet}
    </TooltipTrigger>
    <TooltipContent>
        <p class="font-semibold">Explicit Content</p>
        <p class="text-xs text-muted leading-tight max-w-53">
            {categoryInfos.explicit.description}
        </p>
    </TooltipContent>
</Tooltip>
