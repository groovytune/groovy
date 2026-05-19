import z from 'zod';

export const newLyricsSchema = z.object({
    format: z.literal([
        'LRC',
        'TTML',
        'LYS',
        'YRC',
        'LYL',
        'TXT',
    ]),
    content: z.string().min(1).max(10000)
});
