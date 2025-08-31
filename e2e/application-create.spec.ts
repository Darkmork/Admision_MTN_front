import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Application Creation
 * Flujo f2) application-create.spec.ts (crear y enviar postulación mínima)
 * Sistema de Admisión MTN - Fase 0 Pre-flight
 */

test.describe('Application Creation', () => {
  
  // Test data for creating application
  const testApplicationData = {
    student: {
      firstName: 'Juan Carlos',
      lastName: 'Pérez López', 
      rut: '20123456-7',
      birthDate: '2015-03-15',
      grade: 'KINDER'
    },
    father: {
      firstName: 'Carlos',
      lastName: 'Pérez',
      rut: '12345678-9',
      email: 'carlos.perez@test.com',
      phone: '+56912345678'
    },
    mother: {
      firstName: 'María',
      lastName: 'López',
      rut: '98765432-1', 
      email: 'maria.lopez@test.com',
      phone: '+56987654321'
    }
  };

  test.beforeEach(async ({ page }) => {
    // Login as apoderado first
    await page.goto('/apoderado/login');
    await page.fill('[data-testid="email-input"]', 'familia01@test.cl');
    await page.fill('[data-testid="password-input"]', 'secret');
    await page.click('[data-testid="login-button"]');
    
    // Wait for family dashboard
    await expect(page).toHaveURL(/.*apoderado/);
  });

  test('f2) Crear postulación completa exitosamente', async ({ page }) => {
    // Navigate to create application
    await page.click('[data-testid="create-application-button"]');
    await expect(page).toHaveURL(/.*postulacion.*crear/);
    
    // Fill student information
    await page.fill('[data-testid="student-firstName"]', testApplicationData.student.firstName);
    await page.fill('[data-testid="student-lastName"]', testApplicationData.student.lastName);
    await page.fill('[data-testid="student-rut"]', testApplicationData.student.rut);
    await page.fill('[data-testid="student-birthDate"]', testApplicationData.student.birthDate);
    await page.selectOption('[data-testid="student-grade"]', testApplicationData.student.grade);
    
    // Next step - Father information
    await page.click('[data-testid="next-step-button"]');
    
    await page.fill('[data-testid="father-firstName"]', testApplicationData.father.firstName);
    await page.fill('[data-testid="father-lastName"]', testApplicationData.father.lastName);
    await page.fill('[data-testid="father-rut"]', testApplicationData.father.rut);
    await page.fill('[data-testid="father-email"]', testApplicationData.father.email);
    await page.fill('[data-testid="father-phone"]', testApplicationData.father.phone);
    
    // Next step - Mother information
    await page.click('[data-testid="next-step-button"]');
    
    await page.fill('[data-testid="mother-firstName"]', testApplicationData.mother.firstName);
    await page.fill('[data-testid="mother-lastName"]', testApplicationData.mother.lastName);
    await page.fill('[data-testid="mother-rut"]', testApplicationData.mother.rut);
    await page.fill('[data-testid="mother-email"]', testApplicationData.mother.email);
    await page.fill('[data-testid="mother-phone"]', testApplicationData.mother.phone);
    
    // Next step - Guardian & Supporter (auto-filled from parents)
    await page.click('[data-testid="next-step-button"]');
    
    // Verify auto-filled guardian information
    await expect(page.locator('[data-testid="guardian-firstName"]'))
      .toHaveValue(testApplicationData.mother.firstName);
    
    // Select target school
    await page.selectOption('[data-testid="target-school"]', 'MONTE_TABOR');
    
    // Add comments
    await page.fill('[data-testid="comments"]', 'Postulación de prueba E2E');
    
    // Submit application
    await page.click('[data-testid="submit-application-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]'))
      .toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText(/postulación.*creada.*exitosamente/i);
    
    // Verify redirect to application list
    await expect(page).toHaveURL(/.*mis-postulaciones/);
    
    // Verify application appears in list
    await expect(page.locator('[data-testid="application-card"]').first())
      .toContainText(testApplicationData.student.firstName);
    await expect(page.locator('[data-testid="application-status"]').first())
      .toContainText('PENDING');
  });

  test('f2) Validación de campos requeridos', async ({ page }) => {
    await page.click('[data-testid="create-application-button"]');
    
    // Try to proceed without filling required fields
    await page.click('[data-testid="next-step-button"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="student-firstName-error"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="student-lastName-error"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="student-rut-error"]'))
      .toBeVisible();
    
    // Verify we stay on the same step
    await expect(page.locator('[data-testid="step-indicator"]'))
      .toContainText('Paso 1');
  });

  test('f2) Validación de RUT inválido', async ({ page }) => {
    await page.click('[data-testid="create-application-button"]');
    
    // Fill with invalid RUT
    await page.fill('[data-testid="student-rut"]', '12345678-0');
    await page.blur('[data-testid="student-rut"]');
    
    // Verify RUT validation error
    await expect(page.locator('[data-testid="student-rut-error"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="student-rut-error"]'))
      .toContainText(/RUT.*inválido/i);
  });

  test('f2) Validación de email inválido', async ({ page }) => {
    await page.click('[data-testid="create-application-button"]');
    
    // Navigate to father step
    await page.fill('[data-testid="student-firstName"]', 'Test');
    await page.fill('[data-testid="student-lastName"]', 'Student');
    await page.fill('[data-testid="student-rut"]', '20123456-7');
    await page.click('[data-testid="next-step-button"]');
    
    // Fill with invalid email
    await page.fill('[data-testid="father-email"]', 'invalid-email');
    await page.blur('[data-testid="father-email"]');
    
    // Verify email validation error
    await expect(page.locator('[data-testid="father-email-error"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="father-email-error"]'))
      .toContainText(/email.*válido/i);
  });

  test('f2) Navegación entre pasos funciona correctamente', async ({ page }) => {
    await page.click('[data-testid="create-application-button"]');
    
    // Fill step 1
    await page.fill('[data-testid="student-firstName"]', testApplicationData.student.firstName);
    await page.fill('[data-testid="student-lastName"]', testApplicationData.student.lastName);
    await page.fill('[data-testid="student-rut"]', testApplicationData.student.rut);
    
    // Go to step 2
    await page.click('[data-testid="next-step-button"]');
    await expect(page.locator('[data-testid="step-indicator"]'))
      .toContainText('Paso 2');
    
    // Go back to step 1
    await page.click('[data-testid="previous-step-button"]');
    await expect(page.locator('[data-testid="step-indicator"]'))
      .toContainText('Paso 1');
    
    // Verify form data is preserved
    await expect(page.locator('[data-testid="student-firstName"]'))
      .toHaveValue(testApplicationData.student.firstName);
  });

  test('f2) Guardar borrador funciona', async ({ page }) => {
    await page.click('[data-testid="create-application-button"]');
    
    // Fill partial information
    await page.fill('[data-testid="student-firstName"]', testApplicationData.student.firstName);
    await page.fill('[data-testid="student-lastName"]', testApplicationData.student.lastName);
    
    // Save draft
    await page.click('[data-testid="save-draft-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="draft-saved-message"]'))
      .toBeVisible({ timeout: 5000 });
    
    // Navigate away and back
    await page.goto('/apoderado');
    await page.click('[data-testid="create-application-button"]');
    
    // Verify draft is restored
    await expect(page.locator('[data-testid="student-firstName"]'))
      .toHaveValue(testApplicationData.student.firstName);
  });

  test('f2) Selección de colegio objetivo', async ({ page }) => {
    await page.click('[data-testid="create-application-button"]');
    
    // Navigate through steps to school selection
    await page.fill('[data-testid="student-firstName"]', testApplicationData.student.firstName);
    await page.fill('[data-testid="student-lastName"]', testApplicationData.student.lastName);
    await page.fill('[data-testid="student-rut"]', testApplicationData.student.rut);
    await page.click('[data-testid="next-step-button"]'); // Father
    await page.click('[data-testid="next-step-button"]'); // Mother
    await page.click('[data-testid="next-step-button"]'); // Final
    
    // Test school selection
    await page.selectOption('[data-testid="target-school"]', 'MONTE_TABOR');
    await expect(page.locator('[data-testid="target-school"]'))
      .toHaveValue('MONTE_TABOR');
    
    await page.selectOption('[data-testid="target-school"]', 'NAZARET');
    await expect(page.locator('[data-testid="target-school"]'))
      .toHaveValue('NAZARET');
  });

  test('f2) Cancelar postulación funciona', async ({ page }) => {
    await page.click('[data-testid="create-application-button"]');
    
    // Fill some information
    await page.fill('[data-testid="student-firstName"]', 'Test');
    
    // Cancel application
    await page.click('[data-testid="cancel-button"]');
    
    // Verify confirmation dialog
    await expect(page.locator('[data-testid="cancel-confirmation-dialog"]'))
      .toBeVisible();
    
    // Confirm cancellation
    await page.click('[data-testid="confirm-cancel-button"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*apoderado/);
  });

  test('f2) Performance de creación de postulación', async ({ page }) => {
    const startTime = Date.now();
    
    await page.click('[data-testid="create-application-button"]');
    
    // Quick form fill
    await page.fill('[data-testid="student-firstName"]', testApplicationData.student.firstName);
    await page.fill('[data-testid="student-lastName"]', testApplicationData.student.lastName);
    await page.fill('[data-testid="student-rut"]', testApplicationData.student.rut);
    await page.fill('[data-testid="student-birthDate"]', testApplicationData.student.birthDate);
    await page.selectOption('[data-testid="student-grade"]', testApplicationData.student.grade);
    
    await page.click('[data-testid="next-step-button"]');
    await page.click('[data-testid="next-step-button"]'); // Skip father (optional)
    await page.click('[data-testid="next-step-button"]'); // Skip mother (optional) 
    
    await page.selectOption('[data-testid="target-school"]', 'MONTE_TABOR');
    await page.click('[data-testid="submit-application-button"]');
    
    // Wait for success
    await expect(page.locator('[data-testid="success-message"]'))
      .toBeVisible({ timeout: 10000 });
    
    const endTime = Date.now();
    const creationTime = endTime - startTime;
    
    // Application creation should complete in under 10 seconds
    expect(creationTime).toBeLessThan(10000);
  });
});