import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://alecid08.github.io',
  base: '/inventario/',
  trailingSlash: 'always',
  integrations: [react()],
});
