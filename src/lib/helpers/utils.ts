import { match, resolve } from '$app/paths';
import { clsx, type ClassValue } from "clsx";
import { DateTime } from 'luxon';
import { twMerge } from "tailwind-merge";
import type { Release, Track, User } from '$lib/server/prisma/browser';
import { Appwrite } from '$lib/client/appwrite';
import { Image } from '$lib/client/image';
import { ImageFormat } from 'appwrite';
import { releaseTypeNames } from './constants';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any; } ? Omit<T, "child"> : T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export type PartialUser = Pick<User, 'id'|'name'|'username'|'image'>;

export function createAuthRedirect(type: 'signin'|'signout', url: string|URL) {
    const authURL = type === 'signin' ? resolve('/(auth)/signin') : resolve('/(auth)/signout');
    const redirectURL = url instanceof URL ? url.toString() : url;

    return `${authURL}?redirect=${encodeURIComponent(redirectURL)}`;
}

export function createUserProfileURL(data: { id: string; username?: string|null; }) {
    return resolve(
        '/(app)/artist/[userResolvable]',
        {
            userResolvable: data.username ? `@${data.username}` : data.id
        }
    );
}

export function formatDuration(duration: number, pattern = 'm:ss') {
    return DateTime.fromSeconds(duration).toFormat(pattern, { locale: 'en' });
}

export function formatFileSize(bytes: number, decimals = 2) {
    if (bytes === 0) {
        return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getLocale(): string {
    if (typeof navigator !== 'undefined') {
        return navigator.language || 'en-US';
    }

    return 'en-US';
}

export function shuffleArray<T>(array: T[], mutate: boolean = true): T[] {
    array = mutate ? array : [...array];

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

export async function getPostMediaFiles(ids: string[]): Promise<{ type: 'image'|'video'; mime?: string; url: string; }[]> {
    const files: { type: 'image'|'video'; mime?: string; url: string; }[] = [];

    for (const id of ids) {
        const data = await Appwrite.storage.getFile({
            bucketId: 'media',
            fileId: id
        }).catch(() => null);

        if (!data) continue;

        const url = Appwrite.storage.getFileView({
            bucketId: 'media',
            fileId: id
        });

        files.push({
            type: data.mimeType.startsWith('video') ? 'video' : 'image',
            mime: data.mimeType,
            url
        });
    }

    return files;
}

export async function fetchPostURLPreview(
    content: string,
    options?: {
        origin?: string;
        fetchReleaseUser?: (id: string) => Promise<PartialUser|null>;
        fetchReleaseInfo?: (id: string) => Promise<Release|null>;
    }
): Promise<{ title: string; description?: string; image?: string; url: string; }|null> {
    const tokens = content.split(/\s+/);

    for (const token of tokens) {
        if (!token.startsWith('http://') && !token.startsWith('https://')) continue;

        let url: URL;

        try {
            url = new URL(token);

            if (options?.origin && url.origin !== options.origin) {
                continue;
            }
        } catch {
            continue;
        }

        const result = await match(url.pathname);
        if (!result) continue;

        switch (result.id) {
            case '/(app)/release/[releaseId]': {
                const { releaseId } = result.params;

                // eslint-disable-next-line no-useless-assignment
                let data: Release|null = null;

                if (options?.fetchReleaseInfo) {
                    data = await options.fetchReleaseInfo(releaseId);
                } else {
                    const response = await fetch(resolve('/(app)/api/release/[releaseId]', { releaseId }));
                    if (!response.ok) continue;

                    data = await response.json();
                }

                if (!data) continue;

                const artist: PartialUser|null = await (
                    options?.fetchReleaseUser
                        ? options.fetchReleaseUser(data.id)
                        : Promise.resolve(null)
                );

                return {
                    title: data.name,
                    url: url.href,
                    description: [
                        releaseTypeNames[data.type],
                        artist?.name,
                        DateTime.fromJSDate(new Date(data.createdAt)).toRelative()
                    ]
                        .filter(Boolean)
                        .join(' · '),
                    image: data.cover
                        ? Image.getPreviewPath({
                            fileId: data.cover,
                            width: 300,
                            height: 300,
                            output: ImageFormat.Webp
                        })
                        : undefined,
                }
            }
            case '/(app)/release/[releaseId]/track/[trackId]': {
                const { trackId } = result.params;

                const response = await fetch(resolve('/(app)/api/track/[trackId]', { trackId }));
                if (!response.ok) continue;

                const data: Track = await response.json();
                const artist: PartialUser|null = await (
                    options?.fetchReleaseUser
                        ? options.fetchReleaseUser(data.releaseId)
                        : Promise.resolve(null)
                );

                return {
                    title: data.name,
                    url: url.href,
                    description: [
                        data.duration ? formatDuration(data.duration) : undefined,
                        artist?.name,
                        DateTime.fromJSDate(new Date(data.createdAt)).toRelative()
                    ]
                        .filter(Boolean)
                        .join(' · '),
                    image: data.cover
                        ? Image.getPreviewPath({
                            fileId: data.cover,
                            width: 300,
                            height: 300,
                            output: ImageFormat.Webp
                        })
                        : undefined,
                }
            }
        }
    }

    return null;
}
