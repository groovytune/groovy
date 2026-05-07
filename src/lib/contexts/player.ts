import { Context } from 'runed';

export const PlayerLastNavigate = new Context<Record<'path', string|null>>('player-last-navigate');
