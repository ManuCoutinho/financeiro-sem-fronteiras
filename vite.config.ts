import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: env.VITE_APP_NAME,
          short_name: env.VITE_APP_SHORT_NAME,
          lang: env.VITE_LOCALE,
          start_url: '/',
          display: 'standalone',
          theme_color: env.VITE_APP_THEME_COLOR,
          background_color: env.VITE_APP_BACKGROUND_COLOR,
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
      }),
    ],
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            include: ['src/**/*.test.{ts,tsx}'],
            environment: 'jsdom',
            env: { VITE_FIREBASE_API_KEY: 'test-api-key', VITE_FIREBASE_APP_ID: 'test-app-id' },
          },
        },
        {
          test: {
            name: 'rules',
            include: ['tests/rules/**/*.test.ts'],
            environment: 'node',
          },
        },
      ],
    },
  };
});
