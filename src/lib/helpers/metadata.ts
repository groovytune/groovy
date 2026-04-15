import { parseBlob, selectCover, type IAudioMetadata, type IPicture } from 'music-metadata';
import ParseAudioMetadata from '$lib/helpers/workers/ParseAudioMetadata.ts?worker';

export type FileMetadata = Pick<IAudioMetadata, 'common'|'format'> & {
    title: string|null;
    cover: IPicture|null;
    duration: number|null;
    [key: string]: unknown;
};

export async function extractFileMetadata(file: File, useWorker?: boolean|Worker): Promise<FileMetadata> {
    if (!useWorker) {
        const { common, format } = await parseBlob(file);

        return {
            title: common.title || file.name || null,
            cover: selectCover(common.picture),
            duration: format.duration || null,
            common,
            format,
        };
    }

    const worker = useWorker instanceof Worker ? useWorker : new ParseAudioMetadata();
    const promise = new Promise<FileMetadata>((resolve, reject) => {
        worker.onmessage = event => {
            resolve(event.data);

            if (useWorker == true) {
                worker.terminate();
            }
        };

        worker.onerror = error => {
            reject(error);

            if (useWorker == true) {
                worker.terminate();
            }
        };
    });

    worker.postMessage({ file });

    return promise;
}
