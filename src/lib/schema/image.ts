import z from 'zod';

export const imageTransformOptionsSchema = z.object({
    width: z.coerce.number().int().positive().optional(),
    height: z.coerce.number().int().positive().optional(),
    gravity: z.enum(['center','top-left','top','top-right','left','right','bottom-left','bottom','bottom-right']).optional(),
    quality: z.coerce.number().min(0).max(100).optional(),
    opacity: z.coerce.number().min(0).max(1).optional(),
    output: z.enum(['jpg','jpeg','png','webp','avif','gif']).optional(),
    token: z.string().min(1).optional(),
    download: z.coerce.boolean().optional()
});
