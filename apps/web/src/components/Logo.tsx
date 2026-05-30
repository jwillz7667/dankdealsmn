import Image from 'next/image';
import Link from 'next/link';

// Intrinsic dimensions of /public/brand/logo.png (wordmark).
const WORDMARK_W = 2175;
const WORDMARK_H = 228;
const RATIO = WORDMARK_W / WORDMARK_H;

interface LogoProps {
  height?: number;
  tone?: 'default' | 'invert';
  href?: string | null;
  priority?: boolean;
  className?: string;
}

/** DankDeals wordmark. `tone="invert"` renders white-on-dark for footers/overlays. */
export function Logo({ height = 22, tone = 'default', href = '/', priority = false, className }: LogoProps) {
  const width = Math.round(height * RATIO);
  const style: React.CSSProperties = {
    height,
    width: 'auto',
    ...(tone === 'invert' ? { filter: 'brightness(0) invert(1)' } : null),
  };

  const img = (
    <Image src="/brand/logo.png" alt="DankDeals" width={width} height={height} priority={priority} style={style} />
  );

  if (href === null) return img;
  return (
    <Link href={href} className={className} aria-label="DankDeals — home">
      {img}
    </Link>
  );
}
