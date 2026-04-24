import { Context } from 'runed';
import type { AudioPlayer } from '../helpers/classes/AudioPlayer.svelte';

export const AudioPlayerContext = new Context<AudioPlayer>('audioPlayer');
