import { parseBlob, selectCover, type IAudioMetadata, type IPicture } from 'music-metadata';

export type FileMetadata = Pick<IAudioMetadata, 'common'|'format'> & {
    title: string|null;
    cover: IPicture|null;
    duration: number|null;
    [key: string]: unknown;
};

export async function extractFileMetadata(file: File): Promise<FileMetadata> {
    const { common, format } = await parseBlob(file);

    const cover = selectCover(common.picture);
    const duration = format.duration ?? null;

    return {
        title: common.title || file.name || null,
        common,
        format,
        cover,
        duration
    };
}
