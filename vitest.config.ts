import { defineConfig } from 'vitest/config';

// Kept separate from vite.config.ts so tests don't load the PWA/Tailwind plugins.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
