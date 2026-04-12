import z from 'zod';

export const newTrackSchema = z.object({
    name: z.string().min(1).max(255),
    cover: z.instanceof(File).refine(file => file.type.startsWith('image/'), { message: 'Cover must be an image file' }).nullable(),
    file: z.instanceof(File).refine(file => file.type.startsWith('audio/'), { message: 'File must be an audio file' }),
    explicit: z.boolean().default(false),
    duration: z.number().int().positive(),
    metadata: z.any().optional()
});

export const editTracklistSchema = z.object({
    releaseId: z.string(),
    tracks: z.union([
        newTrackSchema,
        newTrackSchema
            .omit({ cover: true, file: true })
            .extend({
                id: z.string(),
                cover: z.string().nullable(),
            })
    ])
        .array()
        .default([])
});
