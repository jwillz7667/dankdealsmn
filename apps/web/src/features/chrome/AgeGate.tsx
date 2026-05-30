'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Logo } from '@/components/Logo';

const STORAGE_KEY = 'dd_age_ok';

type Phase = 'hidden' | 'ask' | 'declined';

/**
 * 21+ compliance gate. Rendered ONLY after client mount, so server HTML (and
 * therefore crawlers) always receive the full, unobstructed page — the gate is
 * a purely visual overlay layered on top of already-present content.
 */
export function AgeGate() {
  const [phase, setPhase] = useState<Phase>('hidden');

  useEffect(() => {
    const confirmed = window.localStorage.getItem(STORAGE_KEY) === '1';
    setPhase(confirmed ? 'hidden' : 'ask');
  }, []);

  useEffect(() => {
    const locked = phase === 'ask' || phase === 'declined';
    document.documentElement.style.overflow = locked ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [phase]);

  if (phase === 'hidden') return null;

  const accept = () => {
    window.localStorage.setItem(STORAGE_KEY, '1');
    setPhase('hidden');
  };

  return (
    <div className="agegate" role="dialog" aria-modal="true" aria-label="Age verification">
      <div className="agegate__card">
        <Image src="/brand/car.png" className="car" alt="" width={92} height={53} priority />
        {phase === 'ask' ? (
          <>
            <Logo href={null} height={30} priority />
            <h2>Are you 21 or older?</h2>
            <p>You must be of legal age to enter DankDeals and order cannabis delivery in Minnesota.</p>
            <div className="agegate__btns">
              <button type="button" className="btn btn--lg btn--block" onClick={accept}>
                Yes, I&apos;m 21+
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--block"
                onClick={() => setPhase('declined')}
              >
                No, take me back
              </button>
            </div>
            <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: 14 }}>
              By entering you agree to our Terms &amp; Privacy Policy.
            </p>
          </>
        ) : (
          <>
            <h2>Come back soon</h2>
            <p>You must be 21 or older to use DankDeals.</p>
          </>
        )}
      </div>
    </div>
  );
}
