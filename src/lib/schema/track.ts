import z from 'zod';
import { supportedAudioMimeTypes } from '../helpers/constants';

export const trackFileSchema = z
    .instanceof(File)
    .refine(
        file => supportedAudioMimeTypes.includes(file.type),
        { message: 'File must be an audio file' }
    )
    .refine(
        file => file.size <= 20 * 1024 * 1024,
        { message: 'File size must be less than 20MB' }
    );

export const newTrackSchema = z.object({
    name: z.string().min(1).max(255),
    cover: z
        .instanceof(File)
        .refine(
            file => file.type.startsWith('image/jpg') || file.type.startsWith('image/jpeg') || file.type.startsWith('image/png'),
            { message: 'Cover must be a JPG or PNG file' }
        )
        .refine(
            file => file.size <= 10 * 1024 * 1024,
            { message: 'Cover must be less than 10MB' }
        )
        .optional(),
    file: trackFileSchema,
    explicit: z.boolean().default(false),
    genres: z
        .object({
            id: z.string(),
            name: z.string()
        })
        .array()
        .max(5, { error: 'You can only select up to 5 genres' })
        .default([]),
    duration: z.number().int().positive().nullable(),
    metadata: z.any().optional()
});

export const sortTracksSchema = z.object({
    tracks: z.object({
        id: z.string(),
        position: z.number().int()
    })
        .array()
        .default([])
});

export const uploadTracksSchema = z.object({
    files: trackFileSchema
        .array()
        .refine(
            files => files.reduce((c, f) => f.size + c, 0) <= 20 * 1024 * 1024,
            { message: 'Total file size must be less than 20MB' }
        )
        .nullable()
});

export const editTrackSchema = newTrackSchema
    .omit({ file: true, metadata: true, duration: true })
    .partial();

export const deleteTracksSchema = z.object({
    trackIds: z.string().array().min(1)
});
