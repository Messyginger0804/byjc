import { expect, test } from '@playwright/test';

test('liveness endpoint responds without a database connection', async ({ request }) => {
  const response = await request.get('/api/health/live');
  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toEqual({ status: 'ok' });
});
