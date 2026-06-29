import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'aissam',
  brand: {
    displayName: 'AI쌤',
    primaryColor: '#3182f6',
    icon: 'https://withaissam.vercel.app/logo-light.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite dev',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
