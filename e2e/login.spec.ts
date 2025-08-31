import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for Login Functionality
 * Flujo f1) login.spec.ts (login éxito y error)
 * Sistema de Admisión MTN - Fase 0 Pre-flight
 */

// Test credentials - must match backend test data
const TEST_CREDENTIALS = {
  ADMIN: {
    email: 'admin@mtn.cl',
    password: 'admin123',
    expectedName: 'Admin Test'
  },
  APODERADO: {
    email: 'familia01@test.cl', 
    password: 'secret',
    expectedName: 'Familia Test'
  },
  TEACHER: {
    email: 'maria.nueva@mtn.cl',
    password: 'secret',
    expectedName: 'María Elena Test'
  }
};

test.describe('Login Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('f1) Login exitoso como administrador', async ({ page }) => {
    // Navigate to admin login page
    await page.click('text=Admin');
    await expect(page).toHaveURL(/.*admin.*login/);
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', TEST_CREDENTIALS.ADMIN.email);
    await page.fill('[data-testid="password-input"]', TEST_CREDENTIALS.ADMIN.password);
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful login and redirect to dashboard
    await expect(page).toHaveURL(/.*admin/);
    
    // Verify user is logged in
    await expect(page.locator('[data-testid="user-name"]'))
      .toContainText('Admin', { timeout: 10000 });
    
    // Verify admin dashboard elements are visible
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
    await expect(page.locator('text=Usuarios')).toBeVisible();
    await expect(page.locator('text=Postulaciones')).toBeVisible();
  });

  test('f1) Login exitoso como apoderado', async ({ page }) => {
    // Navigate to apoderado login page  
    await page.click('text=Apoderado');
    await expect(page).toHaveURL(/.*apoderado.*login/);
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', TEST_CREDENTIALS.APODERADO.email);
    await page.fill('[data-testid="password-input"]', TEST_CREDENTIALS.APODERADO.password);
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful login and redirect to family dashboard
    await expect(page).toHaveURL(/.*apoderado/);
    
    // Verify user is logged in
    await expect(page.locator('[data-testid="welcome-message"]'))
      .toContainText('Bienvenido', { timeout: 10000 });
    
    // Verify family dashboard elements
    await expect(page.locator('[data-testid="family-dashboard"]')).toBeVisible();
    await expect(page.locator('text=Mis Postulaciones')).toBeVisible();
  });

  test('f1) Login exitoso como profesor', async ({ page }) => {
    // Navigate to professor login page
    await page.goto('/profesor/login');
    await expect(page).toHaveURL(/.*profesor.*login/);
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', TEST_CREDENTIALS.TEACHER.email);
    await page.fill('[data-testid="password-input"]', TEST_CREDENTIALS.TEACHER.password);
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful login and redirect to professor dashboard
    await expect(page).toHaveURL(/.*profesor.*dashboard/);
    
    // Verify user is logged in
    await expect(page.locator('[data-testid="professor-name"]'))
      .toContainText('María Elena', { timeout: 10000 });
    
    // Verify professor dashboard elements
    await expect(page.locator('[data-testid="professor-dashboard"]')).toBeVisible();
    await expect(page.locator('text=Mis Evaluaciones')).toBeVisible();
  });

  test('f1) Login fallido - credenciales inválidas', async ({ page }) => {
    // Navigate to admin login
    await page.click('text=Admin');
    
    // Fill with invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@test.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Verify error message appears
    await expect(page.locator('[data-testid="error-message"]'))
      .toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText(/credenciales.*inválid/i);
    
    // Verify we stay on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('f1) Login fallido - email inválido', async ({ page }) => {
    await page.click('text=Admin');
    
    // Fill with invalid email format
    await page.fill('[data-testid="email-input"]', 'not-an-email');
    await page.fill('[data-testid="password-input"]', 'somepassword');
    
    await page.click('[data-testid="login-button"]');
    
    // Verify validation error
    await expect(page.locator('[data-testid="email-error"]'))
      .toBeVisible({ timeout: 3000 });
    await expect(page.locator('[data-testid="email-error"]'))
      .toContainText(/email.*válido/i);
  });

  test('f1) Login fallido - campos vacíos', async ({ page }) => {
    await page.click('text=Admin');
    
    // Try to submit empty form
    await page.click('[data-testid="login-button"]');
    
    // Verify validation errors for required fields
    await expect(page.locator('[data-testid="email-required"]'))
      .toBeVisible({ timeout: 3000 });
    await expect(page.locator('[data-testid="password-required"]'))
      .toBeVisible({ timeout: 3000 });
  });

  test('f1) Logout funciona correctamente', async ({ page }) => {
    // Login first
    await page.click('text=Admin');
    await page.fill('[data-testid="email-input"]', TEST_CREDENTIALS.ADMIN.email);
    await page.fill('[data-testid="password-input"]', TEST_CREDENTIALS.ADMIN.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*admin/);
    
    // Logout
    await page.click('[data-testid="logout-button"]');
    
    // Verify redirect to login page
    await expect(page).toHaveURL(/.*login/);
    
    // Verify user is no longer authenticated
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*login/); // Should redirect to login
  });

  test('f1) Remember me funciona', async ({ page }) => {
    await page.click('text=Admin');
    
    // Fill form and check remember me
    await page.fill('[data-testid="email-input"]', TEST_CREDENTIALS.ADMIN.email);
    await page.fill('[data-testid="password-input"]', TEST_CREDENTIALS.ADMIN.password);
    await page.check('[data-testid="remember-me"]');
    
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*admin/);
    
    // Clear cookies and reload
    await page.reload();
    
    // Should still be logged in
    await expect(page).toHaveURL(/.*admin/);
  });

  test('f1) Navegación entre tipos de login', async ({ page }) => {
    // Test navigation between different login types
    await page.click('text=Admin');
    await expect(page).toHaveURL(/.*admin.*login/);
    
    await page.click('text=Apoderado');
    await expect(page).toHaveURL(/.*apoderado.*login/);
    
    await page.click('text=Profesor');
    await expect(page).toHaveURL(/.*profesor.*login/);
    
    // Verify each page has correct elements
    await expect(page.locator('[data-testid="professor-login-form"]')).toBeVisible();
  });

  test('f1) Performance del login', async ({ page }) => {
    // Measure login performance
    const startTime = Date.now();
    
    await page.click('text=Admin');
    await page.fill('[data-testid="email-input"]', TEST_CREDENTIALS.ADMIN.email);
    await page.fill('[data-testid="password-input"]', TEST_CREDENTIALS.ADMIN.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*admin/);
    
    const endTime = Date.now();
    const loginTime = endTime - startTime;
    
    // Login should complete in under 5 seconds
    expect(loginTime).toBeLessThan(5000);
  });
});