import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';

export const auth = betterAuth({
    baseURL: publicEnv.PUBLIC_BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: 'postgresql'
    }),
    logger: {
        level: 'debug'
    },
    user: {
        additionalFields: {
            role: {
                type: ["user", "admin"],
                required: false,
                defaultValue: "user",
                input: false,
            },
            username: {
                type: 'string',
                required: false,
                unique: true
            }
        }
    },
    plugins: [
        sveltekitCookies(getRequestEvent) // Make sure this is the last plugin
    ],
    socialProviders: {
        google: {
            clientId: env.AUTH_GOOGLE_ID!,
            clientSecret: env.AUTH_GOOGLE_SECRET
        },
        discord: {
            clientId: env.AUTH_DISCORD_ID!,
            clientSecret: env.AUTH_DISCORD_SECRET
        }
    },
    trustedOrigins: [
        "http://localhost:5173",
        "http://localhost:4173",
        "https://groovy.foo.ng",
    ],
    advanced: {
        defaultCookieAttributes: {
            sameSite: 'None'
        }
    }
});
