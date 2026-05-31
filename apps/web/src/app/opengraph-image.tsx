import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/site';

// Branded 1200x630 social card; also reused for Twitter (summary_large_image).
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// The logo wordmark mixes near-black ("DANK") with green, so it sits on a white
// pill to stay legible over the dark card. Read off disk at build time (this
// card is statically prerendered) and inlined so it renders before deploy/DNS.
const LOGO_RATIO = 2175 / 228;
const LOGO_HEIGHT = 70;

export default async function OpengraphImage() {
  const logoData = await readFile(join(process.cwd(), 'public', 'brand', 'logo.png'));
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            borderRadius: 18,
            padding: '22px 30px',
          }}
        >
          <img
            src={logoSrc}
            alt={SITE.name}
            width={Math.round(LOGO_HEIGHT * LOGO_RATIO)}
            height={LOGO_HEIGHT}
          />
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
