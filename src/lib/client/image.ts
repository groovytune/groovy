import { resolve } from '$app/paths';
import type { ImageTransform } from '../helpers/classes/ImageTransform';

export namespace Image {
    export interface PreviewOptions {
        width?: number;
        height?: number;
        gravity?: ImageTransform.Gravity;
        quality?: number;
        opacity?: number;
        output?: ImageTransform.OutputFormat;
        token?: string;
        download?: boolean;
    }

    export function getPreviewPath(options: PreviewOptions & { fileId: string; }): string {
        const params = new URLSearchParams();

        if (options.width) params.append('width', options.width.toString());
        if (options.height) params.append('height', options.height.toString());
        if (options.gravity) params.append('gravity', options.gravity);
        if (options.quality) params.append('quality', options.quality.toString());
        if (options.opacity) params.append('opacity', options.opacity.toString());
        if (options.output) params.append('output', options.output);
        if (options.token) params.append('token', options.token);
        if (options.download) params.append('download', 'true');

        return resolve('/(app)/api/assets/image/[fileId]/preview', {
            fileId: options.fileId
        }) + '?' + params.toString();
    }

    export function getViewPath(fileId: string): string {
        return resolve('/(app)/api/assets/image/[fileId]', { fileId });
    }
}
