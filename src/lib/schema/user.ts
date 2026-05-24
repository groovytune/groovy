import { userSchema } from 'better-auth';
import z from 'zod';

export const editUserSchema = z.object({
    name: userSchema.shape.name,
    username: z
        .string()
        .min(4)
        .max(29)
        .regex(/^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/, 'Username can only contain letters, numbers, and underscores')
        .optional(),
    bio: z.string().max(160).trim().optional(),
    favoriteTrackId: z.string().optional(),
    image: z.instanceof(File)
        .refine(
            file => file.type.startsWith('image/jpg') || file.type.startsWith('image/jpeg') || file.type.startsWith('image/png'),
            { message: 'Profile picture must be a JPG or PNG file' }
        )
        .refine(
            file => file.size <= 5 * 1024 * 1024,
            { message: 'Profile picture must be less than 5MB' }
        )
        .optional(),
    genres: z.object({
        id: z.string(),
        name: z.string()
    })
        .array()
        .max(5, { error: 'You can only select up to 5 genres' })
        .default([])
});
