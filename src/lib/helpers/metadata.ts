import { parseBlob, selectCover, type IAudioMetadata, type IPicture } from 'music-metadata';

export type FileMetadata = IAudioMetadata & {
    cover: IPicture|null;
    duration: number|null;
    [key: string]: unknown;
};

export async function extractFileMetadata(file: File): Promise<FileMetadata> {
    const metadata = await parseBlob(file);

    const cover = selectCover(metadata.common.picture);
    const duration = metadata.format.duration ?? null;

    return {
        ...metadata,
        cover,
        duration
    };
}
