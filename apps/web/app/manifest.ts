import type { MetadataRoute } from 'next';
import { brandConfig } from '@claimradar/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brandConfig.siteName,
    short_name: brandConfig.shortName,
    description: brandConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F9FC',
    theme_color: '#0D2148',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
      { src: '/apple-icon.svg', sizes: '180x180', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
