import type { Review } from '../../infrastructure/prisma.js';

export function serializeReview(r: Review) {
  return {
    id: r.id,
    authorName: r.authorName,
    rating: r.rating,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
  };
}

export type ReviewDTO = ReturnType<typeof serializeReview>;
