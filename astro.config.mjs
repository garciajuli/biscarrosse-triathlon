// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Hébergement temporaire sur GitHub Pages en sous-dossier (avant l'achat du domaine).
  // À l'achat du domaine : remettre `site` sur le domaine et `base` sur '/'.
  site: 'https://garciajuli.github.io',
  base: '/biscarrosse-triathlon',
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') })],
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    host: true,
    port: 4321,
  },
  build: {
    // évite une requête bloquante pour le peu de CSS de la page
    inlineStylesheets: 'auto',
  },
});
