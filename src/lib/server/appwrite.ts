import { env } from '$env/dynamic/private';
import { Client, ID as AppwriteID, Storage, Tokens, type Models } from 'node-appwrite';

export namespace Appwrite {
    export const ID = AppwriteID;
    export const client = new Client();
    export const storage = new Storage(client);
    export const tokens = new Tokens(client);

    Appwrite.client
        .setEndpoint(env.APPWRITE_ENDPOINT)
        .setProject(env.APPWRITE_PROJECT_ID)
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
}
