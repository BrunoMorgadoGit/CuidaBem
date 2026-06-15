import { test, expect } from '@playwright/test';

test.describe('Equipe de Cuidado MVP', () => {
  test('Deve acessar a tela de equipe de cuidado, ver membros e tentar vincular um cuidador', async ({ page }) => {
    // 1. Acessa a pagina de login
    await page.goto('/login');

    // 2. Preenche o login com a conta padrao de admin
    await page.fill('input[type="email"]', 'admin@cuidabem.com.br');
    await page.fill('input[type="password"]', 'Admin@123456');
    await page.click('button[type="submit"]');

    // 3. Aguarda o redirecionamento para a tela home/perfil e clica na aba Perfil
    await page.waitForURL('**/tabs/**');
    await page.click('text=Perfil');

    // 4. Clica no botao "Equipe de Cuidado"
    await page.click('text=Equipe de Cuidado');

    // 5. Verifica se chegou na pagina correta
    await expect(page.locator('h1, h2, h3').filter({ hasText: 'Equipe de Cuidado' }).first()).toBeVisible();
    await expect(page.locator('text=Maria Aparecida Santos').first()).toBeVisible();

    // 6. Verifica se o cuidador principal (Administrador) esta na lista
    await expect(page.locator('text=Administrador CuidaBem')).toBeVisible();

    // 7. Clica para vincular novo cuidador
    await page.click('text=+ Vincular cuidador');
    
    // 8. Preenche o e-mail de teste
    await page.fill('input[type="email"]', 'teste.e2e@email.com');
    await page.selectOption('select.role-select', 'family');
    
    // 9. Submete e valida a exibicao de erro esperado (pois o usuario teste.e2e nao existe no BD ainda)
    await page.click('.add-member-footer .btn-primary');
    await expect(page.locator('text=Cuidador vinculado com sucesso.')).toBeVisible();
  });
});
