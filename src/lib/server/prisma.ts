import { env } from '$env/dynamic/private';
import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from './prisma/client';

export const prisma = new PrismaClient({
    accelerateUrl: env.DATABASE_URL!,
}).$extends(withAccelerate());
