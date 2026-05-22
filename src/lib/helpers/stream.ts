import { prisma } from '../server/prisma';

export interface CountStreamOptions {
    trackId: string;
    hostname?: string;
    userAgent?: string;
    userId?: string;
}

export async function countStream(options: CountStreamOptions): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
        const stream = await tx.stream.findFirst({
            where: {
                trackId: options.trackId,
                hostname: options.hostname,
                userAgent: options.userAgent,
                userId: options.userId,
                createdAt: {
                    gte: new Date(Date.now() - 5 * 60 * 1000)
                }
            },
            cacheStrategy: {
                swr: 60,
                ttl: 120
            }
        });

        if (stream) return false;

        await tx.stream.create({
            data: {
                trackId: options.trackId,
                hostname: options.hostname,
                userAgent: options.userAgent,
                userId: options.userId
            }
        });

        return true;
    });
}

