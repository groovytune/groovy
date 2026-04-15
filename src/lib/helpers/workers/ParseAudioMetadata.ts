import { parseBlob, selectCover } from 'music-metadata';

self.onmessage = async event => {
    const { file } = event.data as { file: File };

    const { common, format } = await parseBlob(file);

    self.postMessage({
        title: common.title || file.name || null,
        cover: selectCover(common.picture),
        duration: format.duration ?? null,
        common,
        format,
    });
}
