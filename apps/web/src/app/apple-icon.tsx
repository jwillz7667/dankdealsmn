import { ImageResponse } from 'next/og';

// iOS ignores the manifest + SVG icons and uses this opaque PNG for the home screen.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0c0f0b',
        }}
      >
        <svg
          width="116"
          height="116"
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
      </div>
    ),
    size,
  );
}
