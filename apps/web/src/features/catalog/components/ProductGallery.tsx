'use client';

import { useState } from 'react';
import { ProductMedia } from '@/components/ProductMedia';
import type { ProductImage } from '@/lib/api/types';

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0] ?? null;

  return (
    <div className="pgallery">
      <div className="pgallery__main">
        <ProductMedia src={current?.url ?? null} alt={current?.alt ?? name} sizes="(min-width: 760px) 45vw, 100vw" priority />
      </div>
      {images.length > 1 && (
        <div className="pgallery__thumbs">
          {images.map((img, i) => (
            <button
              type="button"
              key={img.id}
              className={i === active ? 'is-active' : undefined}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-pressed={i === active}
            >
              <ProductMedia src={img.url} alt={img.alt ?? `${name} thumbnail ${i + 1}`} sizes="68px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
