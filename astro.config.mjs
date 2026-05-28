// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://nexora.minhojan-world.site',
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en'],
    routing: {
      prefixDefaultLocale: false, // /  = ko, /en/... = en
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
