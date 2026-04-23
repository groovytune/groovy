import { resolve } from '$app/paths';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any; } ? Omit<T, "child"> : T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function createAuthRedirect(type: 'signin'|'signout', url: string|URL) {
    const authURL = type === 'signin' ? resolve('/(auth)/signin') : resolve('/(auth)/signout');
    const redirectURL = url instanceof URL ? url.toString() : url;

    return `${authURL}?redirect=${encodeURIComponent(redirectURL)}`;
}
