import { prisma } from '../../infrastructure/prisma.js';
import { AppError } from '../../shared/errors.js';
import { serializeReview, type ReviewDTO } from './reviews.serialize.js';
import type { CreateReviewInput } from './reviews.schema.js';

export interface ReviewList {
  items: ReviewDTO[];
  total: number;
  ratingAvg: number;
  ratingCount: number;
}

async function productIdForSlug(slug: string): Promise<string> {
  const product = await prisma.product.findFirst({
    where: { slug, status: 'ACTIVE' },
    select: { id: true },
  });
  if (!product) throw AppError.notFound('Product not found');
  return product.id;
}

export async function listProductReviews(slug: string): Promise<ReviewList> {
  const productId = await productIdForSlug(slug);
  const [rows, product] = await Promise.all([
    prisma.review.findMany({
      where: { productId, status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.product.findUniqueOrThrow({
      where: { id: productId },
      select: { ratingAvg: true, ratingCount: true },
    }),
  ]);

  return {
    items: rows.map(serializeReview),
    total: rows.length,
    ratingAvg: product.ratingAvg.toNumber(),
    ratingCount: product.ratingCount,
  };
}

/**
 * Customer-submitted reviews land in PENDING and are invisible until an admin
 * publishes them (spam/abuse gate). The headline rating is only recomputed when
 * the moderation state of a review changes — see {@link recomputeProductRating}.
 */
export async function createReview(
  slug: string,
  input: CreateReviewInput,
  userId: string | null,
): Promise<{ status: 'PENDING'; message: string }> {
  const productId = await productIdForSlug(slug);
  await prisma.review.create({
    data: {
      productId,
      userId,
      authorName: input.authorName,
      rating: input.rating,
      title: input.title ?? null,
      body: input.body,
      status: 'PENDING',
    },
  });
  return { status: 'PENDING', message: 'Thanks! Your review will appear once approved.' };
}

/**
 * Recomputes a product's denormalized rating from its PUBLISHED reviews. Called
 * after any moderation change so the headline aggregate stays consistent with
 * what shoppers can actually read.
 */
export async function recomputeProductRating(productId: string): Promise<void> {
  const agg = await prisma.review.aggregate({
    where: { productId, status: 'PUBLISHED' },
    _avg: { rating: true },
    _count: { _all: true },
  });
  const count = agg._count._all;
  const avg = agg._avg.rating ?? 0;
  await prisma.product.update({
    where: { id: productId },
    data: { ratingCount: count, ratingAvg: Math.round(avg * 100) / 100 },
  });
}
