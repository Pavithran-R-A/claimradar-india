import { ImageResponse } from 'next/og';
import { brandConfig } from '@claimradar/config';

export const runtime = 'edge';
export const alt = `${brandConfig.siteName} — ${brandConfig.descriptor}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function Mark() {
  return (
    <svg width="100" height="100" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="7" fill="#0D2148" />
      <path
        d="M7 24V10.5L13 4.5H24V15.5L15.5 24H7Z"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 24H15.5L24 15.5"
        stroke="#0F8B8D"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13 4.5V10H18.5Z" fill="#F4A62A" />
    </svg>
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: '#F7F9FC',
        color: '#0D2148',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        padding: '72px 84px',
        width: '100%',
      }}
    >
      <div style={{ alignItems: 'center', display: 'flex', gap: '24px' }}>
        <Mark />
        <span style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-0.04em' }}>
          {brandConfig.siteName}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: 900 }}>
        <div
          style={{
            color: '#0F8B8D',
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Official records, made useful
        </div>
        <div
          style={{
            fontFamily: 'Georgia',
            fontSize: 66,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
          }}
        >
          {brandConfig.tagline}
        </div>
      </div>
      <div style={{ color: '#4A5B74', fontSize: 24 }}>
        {brandConfig.descriptor} · Independent consumer information service
      </div>
    </div>,
    size,
  );
}
