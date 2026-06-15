import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env['CI'] ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:8100',
    trace: 'on-first-retry'
  },
  webServer: [
    {
      command: 'npm --prefix ../Back_end run dev',
      url: 'http://localhost:3000/health',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000
    },
    {
      command: 'npm start',
      url: 'http://localhost:8100',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000
    }
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
