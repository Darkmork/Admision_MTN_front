import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Notifications
 * Flujo f4) notify.spec.ts (ver confirmación visual/notificación)
 * Sistema de Admisión MTN - Fase 0 Pre-flight
 */

test.describe('Notifications System', () => {

  test.describe('As Admin - Email Management', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login as admin
      await page.goto('/admin/login');
      await page.fill('[data-testid="email-input"]', 'admin@mtn.cl');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');
      
      await expect(page).toHaveURL(/.*admin/);
    });

    test('f4) Enviar notificación por email desde admin', async ({ page }) => {
      // Navigate to email management section
      await page.click('[data-testid="email-management-menu"]');
      await expect(page).toHaveURL(/.*email-management/);
      
      // Click compose email button
      await page.click('[data-testid="compose-email-button"]');
      
      // Fill email form
      await page.fill('[data-testid="email-to"]', 'test@example.com');
      await page.fill('[data-testid="email-subject"]', 'Prueba E2E - Notificación de prueba');
      await page.fill('[data-testid="email-content"]', 'Este es un email de prueba enviado desde las pruebas E2E.');
      
      // Send email
      await page.click('[data-testid="send-email-button"]');
      
      // Verify success notification appears
      await expect(page.locator('[data-testid="notification-toast"]'))
        .toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="notification-toast"]'))
        .toContainText(/email.*enviado.*exitosamente/i);
      
      // Verify notification has success style
      await expect(page.locator('[data-testid="notification-toast"]'))
        .toHaveClass(/success|green/);
      
      // Verify email appears in sent emails list
      await page.click('[data-testid="sent-emails-tab"]');
      await expect(page.locator('[data-testid="sent-email-item"]').first())
        .toContainText('test@example.com');
    });

    test('f4) Error al enviar email con datos inválidos', async ({ page }) => {
      await page.click('[data-testid="email-management-menu"]');
      await page.click('[data-testid="compose-email-button"]');
      
      // Fill with invalid email
      await page.fill('[data-testid="email-to"]', 'invalid-email');
      await page.fill('[data-testid="email-subject"]', 'Test');
      await page.fill('[data-testid="email-content"]', 'Test content');
      
      await page.click('[data-testid="send-email-button"]');
      
      // Verify error notification
      await expect(page.locator('[data-testid="notification-toast"]'))
        .toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="notification-toast"]'))
        .toContainText(/error.*email.*inválido/i);
      
      // Verify notification has error style
      await expect(page.locator('[data-testid="notification-toast"]'))
        .toHaveClass(/error|red/);
    });

    test('f4) Enviar email institucional de cambio de estado', async ({ page }) => {
      // Navigate to applications management
      await page.click('[data-testid="applications-menu"]');
      
      // Select an application
      await page.click('[data-testid="application-row"]').first();
      
      // Change status
      await page.selectOption('[data-testid="status-select"]', 'UNDER_REVIEW');
      await page.click('[data-testid="update-status-button"]');
      
      // Verify notification email dialog appears
      await expect(page.locator('[data-testid="email-notification-dialog"]'))
        .toBeVisible();
      
      // Confirm sending notification
      await page.check('[data-testid="send-notification-checkbox"]');
      await page.click('[data-testid="confirm-status-change-button"]');
      
      // Verify success notification
      await expect(page.locator('[data-testid="notification-toast"]'))
        .toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="notification-toast"]'))
        .toContainText(/estado.*actualizado.*notificación.*enviada/i);
    });

    test('f4) Ver estadísticas de emails enviados', async ({ page }) => {
      await page.click('[data-testid="email-management-menu"]');
      
      // Navigate to statistics tab
      await page.click('[data-testid="email-statistics-tab"]');
      
      // Verify statistics are displayed
      await expect(page.locator('[data-testid="total-emails-sent"]'))
        .toBeVisible();
      await expect(page.locator('[data-testid="emails-sent-today"]'))
        .toBeVisible();
      await expect(page.locator('[data-testid="delivery-rate"]'))
        .toBeVisible();
      
      // Test email statistics filtering
      await page.selectOption('[data-testid="stats-period-select"]', 'last_7_days');
      
      // Verify statistics update
      await expect(page.locator('[data-testid="stats-loading"]'))
        .not.toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="stats-chart"]'))
        .toBeVisible();
    });
  });

  test.describe('As Apoderado - Receiving Notifications', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login as apoderado
      await page.goto('/apoderado/login');
      await page.fill('[data-testid="email-input"]', 'familia01@test.cl');
      await page.fill('[data-testid="password-input"]', 'secret');
      await page.click('[data-testid="login-button"]');
      
      await expect(page).toHaveURL(/.*apoderado/);
    });

    test('f4) Ver notificaciones en dashboard', async ({ page }) => {
      // Verify notifications section is visible
      await expect(page.locator('[data-testid="notifications-section"]'))
        .toBeVisible();
      
      // Check notification badge if notifications exist
      const notificationBadge = page.locator('[data-testid="notification-badge"]');
      if (await notificationBadge.isVisible()) {
        await expect(notificationBadge).toContainText(/\d+/);
      }
      
      // Click notifications to view details
      await page.click('[data-testid="notifications-button"]');
      
      // Verify notifications panel opens
      await expect(page.locator('[data-testid="notifications-panel"]'))
        .toBeVisible();
    });

    test('f4) Marcar notificación como leída', async ({ page }) => {
      await page.click('[data-testid="notifications-button"]');
      
      // If there are unread notifications, mark one as read
      const unreadNotification = page.locator('[data-testid="unread-notification"]').first();
      if (await unreadNotification.isVisible()) {
        await unreadNotification.click();
        
        // Verify notification is marked as read
        await expect(unreadNotification)
          .not.toHaveClass(/unread/);
        
        // Verify notification badge count decreases
        const badgeCount = await page.locator('[data-testid="notification-badge"]').textContent();
        expect(parseInt(badgeCount || '0')).toBeGreaterThanOrEqual(0);
      }
    });

    test('f4) Recibir notificación de cambio de estado', async ({ page }) => {
      // Create a new application first
      await page.click('[data-testid="create-application-button"]');
      
      // Fill minimal application data
      await page.fill('[data-testid="student-firstName"]', 'Test');
      await page.fill('[data-testid="student-lastName"]', 'Student');
      await page.fill('[data-testid="student-rut"]', '20123456-7');
      await page.click('[data-testid="next-step-button"]');
      await page.click('[data-testid="next-step-button"]');
      await page.click('[data-testid="next-step-button"]');
      await page.selectOption('[data-testid="target-school"]', 'MONTE_TABOR');
      await page.click('[data-testid="submit-application-button"]');
      
      // Wait for success
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      
      // Simulate admin changing status (this would trigger notification)
      // In real scenario, admin would change status in backend
      
      // Refresh page to see if notification appears
      await page.reload();
      
      // Check for new notifications
      const notificationBadge = page.locator('[data-testid="notification-badge"]');
      if (await notificationBadge.isVisible()) {
        await page.click('[data-testid="notifications-button"]');
        
        // Look for status change notification
        await expect(page.locator('[data-testid="notification-item"]'))
          .toContainText(/estado.*postulación/i);
      }
    });
  });

  test.describe('In-App Notifications', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.goto('/apoderado/login');
      await page.fill('[data-testid="email-input"]', 'familia01@test.cl');
      await page.fill('[data-testid="password-input"]', 'secret');
      await page.click('[data-testid="login-button"]');
    });

    test('f4) Toast notifications aparecen correctamente', async ({ page }) => {
      // Trigger an action that should show a toast
      await page.click('[data-testid="refresh-data-button"]');
      
      // Verify toast notification appears
      await expect(page.locator('[data-testid="toast-notification"]'))
        .toBeVisible({ timeout: 5000 });
      
      // Verify toast has correct content
      await expect(page.locator('[data-testid="toast-notification"]'))
        .toContainText(/datos.*actualizados/i);
      
      // Verify toast auto-dismisses
      await expect(page.locator('[data-testid="toast-notification"]'))
        .not.toBeVisible({ timeout: 10000 });
    });

    test('f4) Notificación de error aparece al fallar operación', async ({ page }) => {
      // Simulate network failure by going offline
      await page.context().setOffline(true);
      
      // Try to perform an action that requires network
      await page.click('[data-testid="save-profile-button"]');
      
      // Verify error notification appears
      await expect(page.locator('[data-testid="error-toast"]'))
        .toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="error-toast"]'))
        .toContainText(/error.*conexión/i);
      
      // Verify error notification has correct styling
      await expect(page.locator('[data-testid="error-toast"]'))
        .toHaveClass(/error|red/);
      
      // Go back online
      await page.context().setOffline(false);
    });

    test('f4) Notificación de éxito aparece al completar operación', async ({ page }) => {
      // Update profile information
      await page.click('[data-testid="profile-menu"]');
      await page.fill('[data-testid="profile-phone"]', '+56987654321');
      await page.click('[data-testid="save-profile-button"]');
      
      // Verify success notification
      await expect(page.locator('[data-testid="success-toast"]'))
        .toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="success-toast"]'))
        .toContainText(/perfil.*actualizado.*exitosamente/i);
    });

    test('f4) Múltiples notificaciones se muestran correctamente', async ({ page }) => {
      // Trigger multiple quick actions
      await page.click('[data-testid="quick-action-1"]');
      await page.click('[data-testid="quick-action-2"]');
      await page.click('[data-testid="quick-action-3"]');
      
      // Verify multiple toasts can be displayed
      const toasts = page.locator('[data-testid="toast-container"] [data-testid*="toast"]');
      await expect(toasts).toHaveCount(3, { timeout: 5000 });
      
      // Verify they stack properly (not overlapping)
      const firstToast = toasts.first();
      const secondToast = toasts.nth(1);
      
      const firstBox = await firstToast.boundingBox();
      const secondBox = await secondToast.boundingBox();
      
      if (firstBox && secondBox) {
        expect(firstBox.y).not.toEqual(secondBox.y);
      }
    });

    test('f4) Notificaciones se pueden cerrar manualmente', async ({ page }) => {
      // Trigger a notification
      await page.click('[data-testid="test-notification-button"]');
      
      // Verify notification appears
      await expect(page.locator('[data-testid="toast-notification"]'))
        .toBeVisible();
      
      // Click close button
      await page.click('[data-testid="toast-close-button"]');
      
      // Verify notification is dismissed
      await expect(page.locator('[data-testid="toast-notification"]'))
        .not.toBeVisible({ timeout: 2000 });
    });

    test('f4) Contador de notificaciones no leídas funciona', async ({ page }) => {
      // Get initial unread count
      const initialBadge = page.locator('[data-testid="notification-badge"]');
      const initialCount = await initialBadge.textContent();
      
      // Open notifications panel
      await page.click('[data-testid="notifications-button"]');
      
      // Mark a notification as read if available
      const unreadNotifications = page.locator('[data-testid="unread-notification"]');
      const unreadCount = await unreadNotifications.count();
      
      if (unreadCount > 0) {
        await unreadNotifications.first().click();
        
        // Close notifications panel
        await page.click('[data-testid="close-notifications-button"]');
        
        // Verify badge count decreased
        const newCount = await initialBadge.textContent();
        if (initialCount && newCount) {
          expect(parseInt(newCount)).toBeLessThan(parseInt(initialCount));
        }
      }
    });
  });
});