import { resolve } from '$app/paths';
import { clsx, type ClassValue } from "clsx";
import { DateTime } from 'luxon';
import { twMerge } from "tailwind-merge";
import type { User } from '../server/prisma/browser';

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

export function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];

        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}
