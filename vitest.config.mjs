import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{js,jsx,ts,tsx}', 'scripts/**/*.test.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      exclude: ['src/app/**/page.js', 'src/app/**/layout.js', 'src/components/**/svgs/**'],
      thresholds: {
        lines: 75,
        functions: 80,
        statements: 75,
        branches: 70,
      },
    },
  },
});
