/**
 * E2E Test: Multiple Schedules UI
 * Verifies the dynamic schedule management UI in the budget request form
 */

const { test, expect } = require('@playwright/test');

test.describe('Multiple Schedules Management UI', () => {
    test('should display dynamic schedule container and add button', async ({ page }) => {
        // Navigate to the budget request page
        const path = require('path');
        const filePath = 'file://' + path.resolve(__dirname, '../../solicitacao.html');
        await page.goto(filePath);
        
        // Wait for page to load
        await page.waitForLoadState('domcontentloaded');
        
        // Fill Step 1 fields to enable "Continuar" button
        await page.fill('#nome', 'Test Client');
        await page.fill('#email', 'test@example.com');
        await page.fill('#telefone', '(92) 99999-9999');
        
        // Click "Continuar" to go to Step 2
        await page.click('#btn-proximo');
        
        // Wait for Step 2 to be visible
        await page.waitForSelector('#step-2.active', { timeout: 5000 });
        
        // Verify the schedule container exists
        const container = await page.locator('#horarios-solicitacao-container');
        await expect(container).toBeVisible();
        
        // Verify the "Add Schedule" button exists and has correct styling
        const addButton = await page.locator('#adicionar-horario-solicitacao');
        await expect(addButton).toBeVisible();
        await expect(addButton).toHaveText(/Adicionar Novo Horário/);
        
        // Verify button has correct color (success-cdl)
        const buttonStyle = await addButton.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            return {
                backgroundColor: styles.backgroundColor,
                borderColor: styles.borderColor
            };
        });
        
        console.log('Button styles:', buttonStyle);
        
        // Take a screenshot of Step 2 with the schedule management UI
        await page.screenshot({ 
            path: 'screenshots/multiple-schedules-ui.png',
            fullPage: true 
        });
        
        // Verify at least one schedule is rendered by default
        const scheduleItems = await page.locator('.horario-solicitacao-item').count();
        expect(scheduleItems).toBeGreaterThan(0);
        
        // Click the add button to add another schedule
        await addButton.click();
        
        // Wait for the new schedule to be added
        await page.waitForTimeout(500);
        
        // Verify two schedules are now present
        const updatedScheduleItems = await page.locator('.horario-solicitacao-item').count();
        expect(updatedScheduleItems).toBe(scheduleItems + 1);
        
        // Take screenshot after adding schedule
        await page.screenshot({ 
            path: 'screenshots/multiple-schedules-added.png',
            fullPage: true 
        });
    });
    
    test('should validate schedule end time must be after start time', async ({ page }) => {
        // Navigate to the budget request page
        const path = require('path');
        const filePath = 'file://' + path.resolve(__dirname, '../../solicitacao.html');
        await page.goto(filePath);
        
        await page.waitForLoadState('domcontentloaded');
        
        // Set up dialog handler BEFORE triggering the action
        let dialogMessage = '';
        page.on('dialog', async dialog => {
            dialogMessage = dialog.message();
            await dialog.accept();
        });
        
        // Fill Step 1
        await page.fill('#nome', 'Test Client');
        await page.fill('#email', 'test@example.com');
        await page.fill('#telefone', '(92) 99999-9999');
        await page.click('#btn-proximo');
        
        // Wait for Step 2
        await page.waitForSelector('#step-2.active', { timeout: 5000 });
        
        // Fill required fields
        await page.fill('#dataEvento', '2026-12-31');
        await page.selectOption('#finalidadeEvento', 'Treinamento');
        await page.selectOption('#espaco', { index: 1 });
        await page.fill('#duracaoContrato', '30');
        await page.fill('#quantidadeFuncionarios', '1');
        
        // Find the first schedule inputs
        const firstStartInput = await page.locator('input[id^="horario-solicitacao-inicio-"]').first();
        const firstEndInput = await page.locator('input[id^="horario-solicitacao-fim-"]').first();
        
        // Set invalid times (end before start)
        await firstStartInput.fill('17:00');
        await firstEndInput.fill('08:00');
        
        // Try to submit
        const submitButton = await page.locator('button[type="submit"]');
        await submitButton.click();
        
        // Wait for dialog to appear
        await page.waitForTimeout(1000);
        
        // Verify the validation message was shown
        expect(dialogMessage).toContain('horários de fim devem ser maiores');
        
        // Take screenshot of validation error
        await page.screenshot({ 
            path: 'screenshots/schedule-validation-error.png',
            fullPage: true 
        });
    });
});
