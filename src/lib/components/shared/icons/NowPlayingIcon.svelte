<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { cn } from '$lib/helpers/utils';

    let props: HTMLAttributes<SVGSVGElement> = $props();
</script>

<svg {...props} class={cn("inline", props.class)} xmlns="http://www.w3.org/2000/svg" width="13.6" height="22" viewBox="5.2 1 13.6 22">
	<rect width="2.8" height="12" x="5.2" y="6" fill="currentColor">
		<animate id="SVGLQdHQe4p" attributeName="y" begin="0;SVGg3vsIeGm.end-0.22s" calcMode="spline" dur="1.32s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="6;1;6" />
		<animate attributeName="height" begin="0;SVGg3vsIeGm.end-0.22s" calcMode="spline" dur="1.32s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="12;22;12" />
	</rect>
	<rect width="2.8" height="12" x="10.7" y="6" fill="currentColor">
		<animate attributeName="y" begin="SVGLQdHQe4p.begin+0.44s" calcMode="spline" dur="1.32s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="6;1;6" />
		<animate attributeName="height" begin="SVGLQdHQe4p.begin+0.44s" calcMode="spline" dur="1.32s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="12;22;12" />
	</rect>
	<rect width="2.8" height="12" x="16" y="6" fill="currentColor">
		<animate id="SVGg3vsIeGm" attributeName="y" begin="SVGLQdHQe4p.begin+0.88s" calcMode="spline" dur="1.32s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="6;1;6" />
		<animate attributeName="height" begin="SVGLQdHQe4p.begin+0.88s" calcMode="spline" dur="1.32s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="12;22;12" />
	</rect>
</svg>

