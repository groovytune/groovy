import { match, resolve } from '$app/paths';
import { clsx, type ClassValue } from "clsx";
import { DateTime } from 'luxon';
import { twMerge } from "tailwind-merge";
import type { Release, Track, User } from '../server/prisma/browser';
import { Appwrite } from '../client/appwrite';
import { Image } from '../client/image';
import { ImageFormat } from 'appwrite';
import { ReleaseInfoCache } from './classes/ReleaseInfoCache.svelte';

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

export function roundToTwoDecimals(num: number): number {
    return Math.round(num * 100) / 100;
}

export function getLocale(): string {
    if (typeof navigator !== 'undefined') {
        return navigator.language || 'en-US';
    }

    return 'en-US';
}

export async function getPostMediaFiles(ids: string[]): Promise<{ type: 'image'|'video'; url: string; }[]> {
    const files: { type: 'image'|'video'; url: string; }[] = [];

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
            url
        });
    }

    return files;
}

export async function fetchPostURLPreview(content: string, origin?: string): Promise<{ title: string; description?: string; image?: string; url: string; }|null> {
    const tokens = content.split(/\s+/);

    for (const token of tokens) {
        if (!token.startsWith('http://') && !token.startsWith('https://')) continue;

        let url: URL;

        try {
            url = new URL(token);

            if (origin && url.origin !== origin) {
                continue;
            }
        } catch {
            continue;
        }

        const result = await match(url.pathname);
        if (!result) continue;

        const releaseInfoCache = ReleaseInfoCache.context.get();

        switch (result.id) {
            case '/(app)/release/[releaseId]': {
                const { releaseId } = result.params;

                const response = await fetch(resolve('/(app)/api/release/[releaseId]', { releaseId }));
                if (!response.ok) continue;

                const data: Release = await response.json();
                const artist: PartialUser|null = await releaseInfoCache
                    .fetchInfo({ type: 'artist', releaseId: data.id })
                    .catch(() => null);

                return {
                    title: data.name,
                    url: url.href,
                    description: [
                        data.type,
                        artist?.name
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
                const artist: PartialUser|null = await releaseInfoCache
                    .fetchInfo({ type: 'artist', releaseId: data.releaseId })
                    .catch(() => null);

                return {
                    title: data.name,
                    url: url.href,
                    description: [
                        data.duration ? formatDuration(data.duration) : undefined,
                        artist?.name
                    ]
                        .filter(Boolean)
                        .join(' · '),
                }
            }
        }
    }

    return null;
}
