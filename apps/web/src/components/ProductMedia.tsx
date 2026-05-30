import Image from 'next/image';
import { Leaf } from 'lucide-react';

/**
 * Renders a product image with next/image, or a branded gradient placeholder
 * when the product has no uploaded image yet (matches the prototype's empty slot).
 */
export function ProductMedia({
  src,
  alt,
  sizes,
  priority = false,
}: {
  src: string | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <span className="pcard__ph" aria-hidden="true">
        <Leaf />
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? '(max-width: 600px) 50vw, (max-width: 1080px) 25vw, 300px'}
      priority={priority}
    />
  );
}
