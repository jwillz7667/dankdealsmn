import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/site';

// Branded 1200x630 social card; also reused for Twitter (summary_large_image).
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0c0f0b 0%, #15240f 100%)',
          padding: 72,
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <svg
            width="76"
            height="76"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#5bbf33"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"
              fill="#3b9322"
            />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
          <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>{SITE.name}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <span style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.03, letterSpacing: -2 }}>
            Cannabis, delivered.
          </span>
          <span style={{ fontSize: 34, color: '#bfe2ac', maxWidth: 880, lineHeight: 1.3 }}>
            Premium, lab-tested flower, edibles &amp; vapes to your door across the Twin Cities in
            60–90 minutes.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 26, color: '#9fb39a' }}>
          <span>dankdealsmn.com</span>
          <span>•</span>
          <span>21+ only · License #{SITE.licenseNumber}</span>
        </div>
      </div>
    ),
    size,
  );
}
