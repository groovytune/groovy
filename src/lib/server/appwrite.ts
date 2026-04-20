import { env } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/public';
import { Client, ID as AppwriteID, Storage, Tokens, type Models, type ImageFormat, type ImageGravity } from 'node-appwrite';
import { Appwrite as AppwriteClient } from '../client/appwrite';

export namespace Appwrite {
    export const ID = AppwriteID;
    export const client = new Client();
    export const storage = new Storage(client);
    export const tokens = new Tokens(client);

    Appwrite.client
        .setEndpoint(envPublic.PUBLIC_APPWRITE_ENDPOINT)
        .setProject(envPublic.PUBLIC_APPWRITE_PROJECT_ID)
        .setKey(env.APPWRITE_API_KEY);

    export function uploadFile(file: File, bucketId: string, permissions?: string[]): Promise<Models.File> {
        return Appwrite.storage.createFile({
            bucketId,
            fileId: Appwrite.ID.unique(),
            file,
            permissions
        });
    }

    export function createFileToken(file: Record<'$id'|'bucketId', string>, expire?: Date|number|string): Promise<Models.ResourceToken> {
        return Appwrite.tokens.createFileToken({
            bucketId: file.bucketId,
            fileId: file.$id,
            expire: expire
                ? expire instanceof Date
                    ? expire.toISOString()
                    : new Date(expire).toISOString()
                : undefined
        });
    }

    export async function createImagePreviewURL(
        options: {
            bucketId: string;
            fileId: string;
            width?: number;
            height?: number;
            gravity?: ImageGravity;
            quality?: number;
            borderWidth?: number;
            borderColor?: string;
            borderRadius?: number;
            opacity?: number;
            rotation?: number;
            background?: string;
            output?: ImageFormat;
            token?: string;
        }
    ): Promise<string> {
        return await Appwrite.storage
            .getFilePreview(options)
            .then((url) => `data:image/webp;base64,${Buffer.from(url).toString('base64')}`)
    }

    export async function createFileEphemeralURL(options: Record<'fileId'|'bucketId', string> & { expire?: Date; }): Promise<string> {
        const token = await createFileToken(
            {
                $id: options.fileId,
                bucketId: options.bucketId,
            },
            options.expire
        );

        const url = AppwriteClient.storage.getFileView({
            bucketId: options.bucketId,
            fileId: options.fileId,
            token: token.$id
        });

        return url;
    }
}
