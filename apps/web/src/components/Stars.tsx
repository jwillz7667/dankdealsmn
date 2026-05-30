import { Star } from 'lucide-react';

/** Compact rating: a single filled star + numeric average and optional count. */
export function Stars({ rating, count }: { rating: number; count?: number }) {
  if (rating <= 0 && !count) return null;
  return (
    <span className="stars" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <Star aria-hidden="true" />
      {rating.toFixed(1)}
      {count !== undefined && count > 0 ? (
        <span className="muted" style={{ fontWeight: 500 }}>
          ({count})
        </span>
      ) : null}
    </span>
  );
}
