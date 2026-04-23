import z from 'zod';

export const newReleaseSchema = z.object({
    type: z.literal(['ALBUM', 'SINGLE', 'EP']).default('SINGLE'),
    name: z.string().min(1).max(255).trim(),
    description: z.string().max(5000).trim().optional(),
    privacy: z.literal(['PUBLIC', 'PRIVATE', 'UNLISTED']).default('PUBLIC'),
    explicit: z.boolean().default(false),
    cover: z.instanceof(File)
        .refine(
            file => file.type.startsWith('image/jpg') || file.type.startsWith('image/jpeg') || file.type.startsWith('image/png'),
            { message: 'Cover must be a JPG or PNG file' }
        )
        .refine(
            file => file.size <= 10 * 1024 * 1024,
            { message: 'Cover must be less than 10MB' }
        )
        .optional(),
    genres: z.object({
        id: z.string(),
        name: z.string()
    })
        .array()
        .max(5, { error: 'You can only select up to 5 genres' })
        .default([]),
});

export const editReleaseSchema = newReleaseSchema.clone();
