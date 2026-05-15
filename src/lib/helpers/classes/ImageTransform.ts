import sharp from 'sharp';
import type z from 'zod';
import type { imageTransformOptionsSchema } from '../../schema/image';

export class ImageTransform {
    public constructor(public sharp: sharp.Sharp) {}

    public async resize(options: Partial<Record<'width'|'height', number> & { gravity?: ImageTransform.Gravity }>) {
        this.sharp.resize({
            height: options.height,
            width: options.width,
            position: options.gravity?.replace(/-/g, '_')
        });

        return this;
    }

    public async opacity(value: number) {
        this.sharp.ensureAlpha(Math.max(0, Math.min(1, value)));
        return this;
    }

    public async toBuffer(options?: { quality?: number; output?: ImageTransform.OutputFormat; }) {
        const quality = Math.max(1, Math.min(100, options?.quality ?? 80));

        switch (options?.output) {
            case 'jpeg':
            case 'jpg':
                return await this.sharp.jpeg({ quality }).toBuffer();
            case 'png':
                return await this.sharp.png({ quality }).toBuffer();
            case 'webp':
                return await this.sharp.webp({ quality }).toBuffer();
            case 'avif':
                return await this.sharp.avif({ quality }).toBuffer();
            case 'gif':
                return await this.sharp.gif().toBuffer();
            default:
                return await this.sharp.toBuffer();
        }
    }
}

export namespace ImageTransform {
    export type Gravity = 'center'|'top-left'|'top'|'top-right'|'left'|'right'|'bottom-left'|'bottom'|'bottom-right';
    export type OutputFormat = 'jpg'|'jpeg'|'png'|'webp'|'avif'|'gif';

    export async function transform(data: ArrayBuffer, options?: z.infer<typeof imageTransformOptionsSchema>): Promise<ArrayBuffer> {
        const transformer = new ImageTransform(sharp(data));

        if (options?.width || options?.height) {
            await transformer.resize({
                width: options.width,
                height: options.height,
                gravity: options.gravity
            });
        }

        if (options?.opacity) {
            await transformer.opacity(options.opacity);
        }

        return new Uint8Array(await transformer.toBuffer({
            quality: options?.quality,
            output: options?.output
        })).buffer;
    }

    export const mimeTypes = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        avif: 'image/avif',
        gif: 'image/gif'
    };
}
