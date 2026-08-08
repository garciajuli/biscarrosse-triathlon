// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Domaine de production (sert au sitemap et aux URLs absolues Open Graph)
  site: 'https://biscarrosse-olympique-triathlon.fr',
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
