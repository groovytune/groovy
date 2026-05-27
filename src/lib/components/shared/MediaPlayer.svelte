<script lang="ts" generics="T extends 'video'|'audio', E extends HTMLVideoElement|HTMLAudioElement = T extends 'video' ? HTMLVideoElement : HTMLAudioElement">
    import { useEventListener } from 'runed';
    import type { HTMLMediaAttributes } from 'svelte/elements';
    import { AudioPlayer } from '../../helpers/classes/AudioPlayer.svelte';

    let {
        src,
        mime,
        type = 'video' as T,
        ref = $bindable(null),
        ...props
    }: {
        src: string;
        mime?: string;
        type?: T;
        ref?: E|null;
    } & HTMLMediaAttributes<E> = $props();

    const audioPlayer = AudioPlayer.context.getOr(null);

    useEventListener(() => ref, 'play', () => audioPlayer?.pause());
    useEventListener(() => audioPlayer?.audio, 'play', () => ref?.pause());
</script>

{#if type === 'video'}
    {@const vidProps = props as HTMLMediaAttributes<HTMLVideoElement>}
    <video {...vidProps} bind:this={ref as E}>
        <source src={src} type={mime}/>
    </video>
{:else if type === 'audio'}
    {@const audProps = props as HTMLMediaAttributes<HTMLAudioElement>}
    <audio {...audProps} bind:this={ref as E}>
        <source src={src} type={mime}/>
    </audio>
{/if}
