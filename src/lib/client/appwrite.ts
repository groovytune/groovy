import { env } from '$env/dynamic/public';
import { Client, Storage } from 'appwrite';

export namespace Appwrite {
    export const client = new Client();
    export const storage = new Storage(client);

    Appwrite.client
        .setEndpoint(env.PUBLIC_APPWRITE_ENDPOINT)
        .setProject(env.PUBLIC_APPWRITE_PROJECT_ID);
}
