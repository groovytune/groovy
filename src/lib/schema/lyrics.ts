import z from 'zod';

export const newLyricsSchema = z.object({
    format: z.enum(['LRC', 'TTML', 'TXT']),
    name: z.string().min(1).max(255),
    content: z.string().min(1).max(10000)
});
