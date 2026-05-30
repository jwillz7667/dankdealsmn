import { z } from 'zod';

export const CreateReviewSchema = z.object({
  authorName: z.string().trim().min(1).max(80),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(3).max(2000),
});
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

export const ReviewSchema = z.object({
  id: z.string(),
  authorName: z.string(),
  rating: z.number(),
  title: z.string().nullable(),
  body: z.string(),
  createdAt: z.string(),
});

export const ReviewListSchema = z.object({
  items: z.array(ReviewSchema),
  total: z.number(),
  ratingAvg: z.number(),
  ratingCount: z.number(),
});

export const CreateReviewResponseSchema = z.object({
  status: z.enum(['PENDING', 'PUBLISHED']),
  message: z.string(),
});
