import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * E2E Tests for Document Upload
 * Flujo f3) upload-doc.spec.ts (subir archivo válido e inválido)
 * Sistema de Admisión MTN - Fase 0 Pre-flight
 */

test.describe('Document Upload', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as apoderado first
    await page.goto('/apoderado/login');
    await page.fill('[data-testid="email-input"]', 'familia01@test.cl');
    await page.fill('[data-testid="password-input"]', 'secret');
    await page.click('[data-testid="login-button"]');
    
    // Wait for family dashboard and navigate to documents
    await expect(page).toHaveURL(/.*apoderado/);
    await page.click('[data-testid="documents-section"]');
  });

  test('f3) Subir documento PDF válido', async ({ page }) => {
    // Click upload button
    await page.click('[data-testid="upload-document-button"]');
    
    // Verify upload modal is open
    await expect(page.locator('[data-testid="upload-modal"]')).toBeVisible();
    
    // Select document type
    await page.selectOption('[data-testid="document-type-select"]', 'BIRTH_CERTIFICATE');
    
    // Add description
    await page.fill('[data-testid="document-description"]', 'Certificado de nacimiento - Prueba E2E');
    
    // Create a test PDF file (minimal valid PDF)
    const testPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test Document E2E) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000136 00000 n 
0000000217 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
310
%%EOF`;

    // Upload file
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles({
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(testPdfContent)
    });
    
    // Verify file is selected
    await expect(page.locator('[data-testid="selected-file-name"]'))
      .toContainText('test-document.pdf');
    
    // Submit upload
    await page.click('[data-testid="upload-submit-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="upload-success-message"]'))
      .toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="upload-success-message"]'))
      .toContainText(/documento.*subido.*exitosamente/i);
    
    // Verify document appears in document list
    await page.click('[data-testid="close-modal-button"]');
    await expect(page.locator('[data-testid="document-item"]').first())
      .toContainText('test-document.pdf');
    await expect(page.locator('[data-testid="document-type"]').first())
      .toContainText('Certificado de Nacimiento');
  });

  test('f3) Subir imagen JPG válida', async ({ page }) => {
    await page.click('[data-testid="upload-document-button"]');
    
    // Select image document type
    await page.selectOption('[data-testid="document-type-select"]', 'STUDENT_PHOTO');
    await page.fill('[data-testid="document-description"]', 'Foto del estudiante - Prueba E2E');
    
    // Create minimal JPEG file
    const jpegBytes = new Uint8Array([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00,
      0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11,
      0x01, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF,
      0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0xD2, 0xFF, 0xD9
    ]);

    await page.locator('[data-testid="file-input"]').setInputFiles({
      name: 'test-photo.jpg',
      mimeType: 'image/jpeg', 
      buffer: Buffer.from(jpegBytes)
    });
    
    await page.click('[data-testid="upload-submit-button"]');
    
    // Verify success
    await expect(page.locator('[data-testid="upload-success-message"]'))
      .toBeVisible({ timeout: 10000 });
  });

  test('f3) Error al subir archivo sin tipo seleccionado', async ({ page }) => {
    await page.click('[data-testid="upload-document-button"]');
    
    // Try to upload without selecting document type
    await page.locator('[data-testid="file-input"]').setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test content')
    });
    
    await page.click('[data-testid="upload-submit-button"]');
    
    // Verify validation error
    await expect(page.locator('[data-testid="document-type-error"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="document-type-error"]'))
      .toContainText(/tipo.*documento.*requerido/i);
  });

  test('f3) Error al subir archivo demasiado grande', async ({ page }) => {
    await page.click('[data-testid="upload-document-button"]');
    await page.selectOption('[data-testid="document-type-select"]', 'BIRTH_CERTIFICATE');
    
    // Create large file (>10MB limit)
    const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
    
    await page.locator('[data-testid="file-input"]').setInputFiles({
      name: 'large-file.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(largeContent)
    });
    
    // Verify file size error
    await expect(page.locator('[data-testid="file-size-error"]'))
      .toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="file-size-error"]'))
      .toContainText(/archivo.*demasiado.*grande/i);
  });

  test('f3) Error al subir tipo de archivo no permitido', async ({ page }) => {
    await page.click('[data-testid="upload-document-button"]');
    await page.selectOption('[data-testid="document-type-select"]', 'BIRTH_CERTIFICATE');
    
    // Try to upload .txt file (not allowed)
    await page.locator('[data-testid="file-input"]').setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is a text file')
    });
    
    // Verify file type error
    await expect(page.locator('[data-testid="file-type-error"]'))
      .toBeVisible({ timeout: 3000 });
    await expect(page.locator('[data-testid="file-type-error"]'))
      .toContainText(/tipo.*archivo.*no.*permitido/i);
  });

  test('f3) Previsualizar documento subido', async ({ page }) => {
    // First upload a document
    await page.click('[data-testid="upload-document-button"]');
    await page.selectOption('[data-testid="document-type-select"]', 'SCHOOL_REPORT');
    
    await page.locator('[data-testid="file-input"]').setInputFiles({
      name: 'school-report.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\ntest content\n%%EOF')
    });
    
    await page.click('[data-testid="upload-submit-button"]');
    
    // Wait for success and close modal
    await expect(page.locator('[data-testid="upload-success-message"]'))
      .toBeVisible();
    await page.click('[data-testid="close-modal-button"]');
    
    // Click preview button
    await page.click('[data-testid="preview-document-button"]');
    
    // Verify document preview modal opens
    await expect(page.locator('[data-testid="document-preview-modal"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="document-preview-title"]'))
      .toContainText('school-report.pdf');
  });

  test('f3) Eliminar documento subido', async ({ page }) => {
    // Upload a document first
    await page.click('[data-testid="upload-document-button"]');
    await page.selectOption('[data-testid="document-type-select"]', 'BIRTH_CERTIFICATE');
    
    await page.locator('[data-testid="file-input"]').setInputFiles({
      name: 'to-delete.pdf',
      mimeType: 'application/pdf', 
      buffer: Buffer.from('%PDF-1.4\ntest\n%%EOF')
    });
    
    await page.click('[data-testid="upload-submit-button"]');
    await expect(page.locator('[data-testid="upload-success-message"]')).toBeVisible();
    await page.click('[data-testid="close-modal-button"]');
    
    // Delete the document
    await page.click('[data-testid="delete-document-button"]');
    
    // Confirm deletion in dialog
    await expect(page.locator('[data-testid="delete-confirmation-dialog"]'))
      .toBeVisible();
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="delete-success-message"]'))
      .toBeVisible();
    
    // Verify document is removed from list
    await expect(page.locator('[data-testid="document-item"]'))
      .toHaveCount(0);
  });

  test('f3) Progreso de subida se muestra', async ({ page }) => {
    await page.click('[data-testid="upload-document-button"]');
    await page.selectOption('[data-testid="document-type-select"]', 'GRADES_2024');
    
    // Upload medium-sized file to see progress
    const mediumContent = 'x'.repeat(1024 * 1024); // 1MB
    await page.locator('[data-testid="file-input"]').setInputFiles({
      name: 'grades.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(mediumContent)
    });
    
    await page.click('[data-testid="upload-submit-button"]');
    
    // Verify progress bar appears
    await expect(page.locator('[data-testid="upload-progress-bar"]'))
      .toBeVisible({ timeout: 3000 });
    
    // Verify progress percentage is shown
    await expect(page.locator('[data-testid="upload-progress-text"]'))
      .toBeVisible();
  });

  test('f3) Lista de tipos de documentos disponibles', async ({ page }) => {
    await page.click('[data-testid="upload-document-button"]');
    
    // Verify all expected document types are available
    const expectedTypes = [
      'BIRTH_CERTIFICATE',
      'SCHOOL_REPORT',
      'GRADES_2023',
      'GRADES_2024', 
      'GRADES_2025_SEMESTER_1',
      'PERSONALITY_REPORT_2024',
      'STUDENT_PHOTO'
    ];
    
    const documentTypeSelect = page.locator('[data-testid="document-type-select"]');
    
    for (const type of expectedTypes) {
      await expect(documentTypeSelect.locator(`option[value="${type}"]`))
        .toBeVisible();
    }
  });

  test('f3) Cancelar subida funciona', async ({ page }) => {
    await page.click('[data-testid="upload-document-button"]');
    
    // Fill some information
    await page.selectOption('[data-testid="document-type-select"]', 'BIRTH_CERTIFICATE');
    await page.fill('[data-testid="document-description"]', 'Test description');
    
    // Cancel upload
    await page.click('[data-testid="cancel-upload-button"]');
    
    // Verify modal is closed
    await expect(page.locator('[data-testid="upload-modal"]'))
      .not.toBeVisible();
    
    // Verify we're back to document list
    await expect(page.locator('[data-testid="documents-list"]'))
      .toBeVisible();
  });
});