import { parseBlob, selectCover, type IAudioMetadata, type IPicture } from 'music-metadata';

export type FileMetadata = Pick<IAudioMetadata, 'common'|'format'> & {
    title: string|null;
    cover: IPicture|null;
    duration: number|null;
    [key: string]: unknown;
};

export type ParseAudioMetadataWorkerMessage = { type: 'success'; data: FileMetadata; }|{ type: 'error'; error: unknown; };

export async function extractFileMetadata(file: File): Promise<FileMetadata> {
    const { common, format } = await parseBlob(file);

    return {
        title: common.title || file.name || null,
        cover: selectCover(common.picture),
        duration: format.duration || null,
        common,
        format,
    };
}
