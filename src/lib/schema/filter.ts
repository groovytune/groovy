import z from 'zod';

export const orderFilterSchema = z.literal(['asc', 'desc']);
