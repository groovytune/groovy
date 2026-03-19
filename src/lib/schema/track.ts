import z from 'zod';

export const newTrackSchema = z.object({
    name: z.string().min(1).max(255),
    cover: z.instanceof(File).refine(file => file.type.startsWith('image/'), { message: 'Cover must be an image file' }).optional(),
    file: z.instanceof(File).refine(file => file.type.startsWith('audio/'), { message: 'File must be an audio file' }),
    duration: z.number().int().positive(),
    metadata: z.any().optional()
});
