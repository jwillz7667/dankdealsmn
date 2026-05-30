import Link from 'next/link';
import { Home, Leaf } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="notfound">
        <h1>404</h1>
        <p>This page wandered off. Let&apos;s get you back to the good stuff.</p>
        <div className="row gap-12 wrap-flow" style={{ justifyContent: 'center' }}>
          <Link className="btn btn--lg" href="/shop">
            <Leaf aria-hidden /> Browse the menu
          </Link>
          <Link className="btn btn--ghost btn--lg" href="/">
            <Home aria-hidden /> Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
