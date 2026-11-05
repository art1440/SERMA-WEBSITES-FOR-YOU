// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// TODO(launch): replace with the real domain once it's decided.
const SITE_URL = 'https://www.example.com';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',
  build: {
    // Inline all CSS: the whole stylesheet is small, and inlining removes a render-blocking request.
    inlineStylesheets: 'always',
    format: 'file',
  },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Bricolage Display',
      cssVariable: '--font-display',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [{ src: ['./src/assets/fonts/bricolage-display-latin.woff2'], weight: '600 800', style: 'normal' }],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Geist',
      cssVariable: '--font-body',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [{ src: ['./src/assets/fonts/geist-latin.woff2'], weight: '100 900', style: 'normal' }],
      },
    },
  ],
});
