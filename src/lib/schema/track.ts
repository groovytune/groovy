import z from 'zod';
import { supportedAudioMimeTypes } from '../helpers/constants';

export const newTrackSchema = z.object({
    name: z.string().min(1).max(255),
    cover: z
        .instanceof(File)
        .refine(file => file.type.startsWith('image/'), { message: 'Cover must be an image file' })
        .nullable(),
    file: z
        .instanceof(File)
        .refine(file => supportedAudioMimeTypes.includes(file.type), { message: 'File must be an audio file' }),
    explicit: z.boolean().default(false),
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
    files: z
        .instanceof(File)
        .refine(file => supportedAudioMimeTypes.includes(file.type), { message: 'File must be an audio file' })
        .array()
        .min(1, { message: 'At least one track must be uploaded' })
        .default([])
});
