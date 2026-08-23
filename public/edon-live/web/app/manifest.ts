import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Edôn — Unified Entity',
    short_name: 'Edôn',
    description: 'Private persistent companion with measured perception, memory, tasks, cognition and device control.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020704',
    theme_color: '#020704',
    orientation: 'any',
    categories: ['utilities','productivity'],
    icons: [
      { src: '/edon-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/edon-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
    ]
  };
}
