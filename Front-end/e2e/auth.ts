import type { Page } from '@playwright/test';

export const TEST_USER = {
  email: 'admin@cuidabem.com.br',
  password: 'Admin@123456'
};

interface TestSession {
  token: string;
  refreshToken: string;
  user: unknown;
  currentPatient: unknown;
}

let cachedSession: TestSession | null = null;

export async function authenticate(page: Page): Promise<void> {
  if (cachedSession === null) {
    const response = await page.request.post('http://localhost:3000/api/auth/login', {
      data: TEST_USER
    });

    if (!response.ok()) {
      throw new Error(`Falha ao autenticar usuario de teste: ${response.status()}`);
    }

    const body = await response.json();
    cachedSession = body.data;
  }

  await page.goto('/login');
  await page.evaluate((session) => {
    localStorage.setItem('cuidabem_token', session.token);
    localStorage.setItem('cuidabem_refresh', session.refreshToken);
    localStorage.setItem('cuida_bem_user', JSON.stringify(session.user));
    localStorage.setItem('cuida_bem_patient', JSON.stringify(session.currentPatient));
  }, cachedSession);
}
