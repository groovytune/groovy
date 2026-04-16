import { parseBlob, selectCover, type IAudioMetadata, type IPicture } from 'music-metadata';

export type FileMetadata = Pick<IAudioMetadata, 'common'|'format'> & {
    title: string|null;
    cover: IPicture|null;
    duration: number|null;
    [key: string]: unknown;
};

export interface PartialFileMetadata {
    year?: number;
    date?: string;
    originaldate?: string;
    originalyear?: number;
    releasedate?: string;
    bpm?: number;
    key?: string;
    mood?: string;
    language?: string;
    copyright?: string;
    license?: string;
    credits?: Partial<Record<
        |'composer'
        |'lyricist'
        |'writer'
        |'remixer'
        |'arranger'
        |'engineer'
        |'producer'
        |'publisher'
        |'djmixer'
        |'mixer'
        |'technician'
        |'label',
        string[]
    >>;
}

export type ParseAudioMetadataWorkerMessage = { type: 'success'; data: FileMetadata; }|{ type: 'error'; error: unknown; };

export async function extractFileMetadata(file: File): Promise<FileMetadata> {
    const { common, format } = await parseBlob(file);

    return {
        title: common.title || file.name || null,
        cover: selectCover(common.picture),
        duration: format.duration ? (Math.round(format.duration) || null) : null,
        common,
        format,
    };
}

export function getPartialMetadata(metadata: Pick<IAudioMetadata, 'common'|'format'>): PartialFileMetadata {
    return {
        year: metadata.common.year,
        date: metadata.common.date,
        originaldate: metadata.common.originaldate,
        originalyear: metadata.common.originalyear,
        releasedate: metadata.common.releasedate,
        bpm: metadata.common.bpm,
        key: metadata.common.key,
        mood: metadata.common.mood,
        language: metadata.common.language,
        copyright: metadata.common.copyright,
        license: metadata.common.license,
        credits: {
            composer: metadata.common.composer,
            lyricist: metadata.common.lyricist,
            writer: metadata.common.writer,
            remixer: metadata.common.remixer,
            arranger: metadata.common.arranger,
            engineer: metadata.common.engineer,
            producer: metadata.common.producer,
            publisher: metadata.common.publisher,
            djmixer: metadata.common.djmixer,
            mixer: metadata.common.mixer,
            technician: metadata.common.technician,
            label: metadata.common.label
        }
    };
}
