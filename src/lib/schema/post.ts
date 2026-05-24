import z from 'zod';

export const newPostSchema = z.object({
    content: z
        .string()
        .max(2000, { error: 'Post cannot exceed 2000 characters' })
        .min(1, { error: 'Post content cannot be empty' })
        .trim(),
    media: z
        .instanceof(File)
        .refine(
            file => file.type.startsWith('image/') || file.type.startsWith('video/'),
            { message: 'Media must be an image or video file' }
        )
        .array()
        .max(4, { error: 'You can only upload up to 4 media files' })
        .refine(
            files => files.reduce((acc, file) => acc + file.size, 0) <= 15 * 1024 * 1024,
            { message: 'Media must be less than 15MB' }
        )
        .optional(),
    referenceId: z.string().optional()
});

export const deletePostSchema = z.object({});
