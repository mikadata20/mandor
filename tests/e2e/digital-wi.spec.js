import { test, expect } from '@playwright/test';

test.describe('MAVI MES — Digital Work Instruction (Digital WI) Enterprise Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Authenticate as Administrator/Engineer before each test
    await page.addInitScript(() => {
      window.localStorage.setItem('mandor_mes_auth_session', JSON.stringify({
        id: 'usr-admin',
        username: 'admin',
        name: 'System Admin',
        role: 'ADMINISTRATOR',
        assignedStation: 'ALL',
        assignedApp: 'ALL'
      }));
    });
  });

  test('1. WI Dashboard loads cleanly with KPIs and tables', async ({ page }) => {
    await page.goto('/#/digital-wi');
    await page.waitForLoadState('domcontentloaded');

    // Header check
    const header = page.locator('text=Digital Work Instruction (WI) Hub');
    await expect(header).toBeVisible({ timeout: 15000 });

    // KPI Cards check
    await expect(page.locator('text=Total WI')).toBeVisible();
    await expect(page.locator('span', { hasText: 'Draft' }).first()).toBeVisible();
    await expect(page.locator('span', { hasText: 'Pending' }).first()).toBeVisible();
    await expect(page.locator('span', { hasText: 'Published' }).first()).toBeVisible();

    // Table should contain demo WIs
    await expect(page.locator('text=Hydraulic Cylinder Main Piston Assembly').first()).toBeVisible();

    await page.screenshot({ path: 'tests/e2e/screenshots/digital-wi-dashboard.png', fullPage: true });
  });

  test('2. TopNavbar confirms Digital WI dropdown menu is removed', async ({ page }) => {
    await page.goto('/#/');
    await page.waitForLoadState('domcontentloaded');

    // Confirm Digital WI dropdown is not present in top navbar
    const navDropdownBtn = page.locator('nav button:has-text("Digital WI")');
    await expect(navDropdownBtn).toBeHidden();
  });

  test('3. AI WI Converter loads demo PDF and extracts steps with checkpoints', async ({ page }) => {
    await page.goto('/#/digital-wi/import');
    await page.waitForLoadState('domcontentloaded');

    // Click Load Demo Industrial PDF
    const demoBtn = page.locator('button:has-text("Load Demo Industrial PDF")');
    await expect(demoBtn).toBeVisible({ timeout: 15000 });
    await demoBtn.click();

    // Verify pages appeared
    await expect(page.locator('text=Demo_Valve_Assembly_SOP.pdf').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Page 1').first()).toBeVisible();

    // Click Start AI Extraction
    const extractBtn = page.locator('button:has-text("Start AI Extraction")');
    await expect(extractBtn).toBeVisible();
    await extractBtn.click();

    // Verify review screen is shown
    await expect(page.locator('text=AI EXTRACTION SUCCESSFUL')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Open in Visual Step Editor')).toBeVisible();

    await page.screenshot({ path: 'tests/e2e/screenshots/digital-wi-converter.png', fullPage: true });
  });

  test('4. Visual Editor loads steps, instruction, paper size and orientation', async ({ page }) => {
    await page.goto('/#/digital-wi/editor/wi-hc-100-assy');
    await page.waitForLoadState('domcontentloaded');

    // Verify Odoo WI Studio header
    await expect(page.locator('text=WI STUDIO')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('wi-doc-number')).toHaveValue('WI-ASSY-001');

    // Verify Paper Size selector and Orientation buttons
    const paperSelect = page.getByTestId('paper-size-select');
    await expect(paperSelect).toBeVisible();
    await expect(paperSelect).toHaveValue('A4');

    const portraitBtn = page.getByTestId('orientation-portrait-btn');
    const landscapeBtn = page.getByTestId('orientation-landscape-btn');
    await expect(portraitBtn).toBeVisible();
    await expect(landscapeBtn).toBeVisible();

    // Verify ISO Title Block on canvas
    await expect(page.locator('text=MAVI MES — DIGITAL WI')).toBeVisible();

    // Test switching to Portrait
    await portraitBtn.click();
    await expect(page.locator('text=PORTRAIT').first()).toBeVisible();

    // Test switching back to Landscape
    await landscapeBtn.click();
    await expect(page.locator('text=LANDSCAPE').first()).toBeVisible();

    // Verify Odoo left tabs
    await expect(page.locator('button:has-text("Steps")')).toBeVisible();

    // Verify active widgets on canvas
    await expect(page.locator('text=Step Instructions').first()).toBeVisible();

    // Verify Print Modal and Clean Printout
    const printBtn = page.getByTestId('print-wi-btn');
    await expect(printBtn).toBeVisible();
    await printBtn.click();

    // Verify Print Selection Modal appears
    await expect(page.locator('text=Print Work Instruction')).toBeVisible();
    await expect(page.locator('text=Cetak Seluruh Langkah (Lengkap)')).toBeVisible();

    // Emulate Print Media to verify ONLY WI sheets render (UI is hidden)
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('#wi-screen-editor')).toBeHidden();
    await expect(page.locator('#wi-print-document')).toBeVisible();
    await expect(page.locator('#wi-print-document').locator('text=ORGANIZATION / SYSTEM').first()).toBeVisible();

    // Take screenshot of pure print output
    await page.screenshot({ path: 'tests/e2e/screenshots/digital-wi-clean-printout.png', fullPage: true });

    // Restore screen media
    await page.emulateMedia({ media: 'screen' });
    await expect(page.locator('#wi-screen-editor')).toBeVisible();

    // Close modal
    await page.locator('button:has-text("Batal")').click();

    // Take screenshot of Odoo WI Studio with Paper Size and Orientation
    await page.screenshot({ path: 'tests/e2e/screenshots/digital-wi-editor-odoo.png', fullPage: true });
  });

  test('4b. Blank Screen creation & PowerPoint-style Free Size side-by-side widgets', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto('/#/digital-wi/editor');
    await page.waitForLoadState('domcontentloaded');

    // Verify draft WI loaded
    await expect(page.locator('text=WI STUDIO')).toBeVisible({ timeout: 15000 });

    // Click "+ Blank" to add a new Blank Screen / Slide
    const blankBtn = page.getByTestId('add-blank-screen-btn');
    await expect(blankBtn).toBeVisible();
    await blankBtn.click();

    // Verify PowerPoint style Blank Screen placeholder appears
    await expect(page.locator('text=Canvas Layar Kosong (PowerPoint Style)')).toBeVisible();
    await page.screenshot({ path: 'tests/e2e/screenshots/digital-wi-blank-screen.png' });

    // Add widgets directly onto blank screen
    await page.locator('button:has-text("+ Text Instructions")').click();
    await page.waitForTimeout(300);

    // Switch to Add Widgets tab to add another widget
    await page.locator('button:has-text("Add Widgets")').click();
    await page.locator('button:has-text("CAD / Drawing Preview")').click();
    await page.waitForTimeout(300);

    // Set first widget width to 1/2
    const firstHalfBtn = page.locator('button:has-text("1/2")').first();
    await firstHalfBtn.click();

    // Set second widget width to 1/2
    const secondHalfBtn = page.locator('button:has-text("1/2")').nth(1);
    await secondHalfBtn.click();

    // Verify both widgets are visible on canvas side-by-side
    await expect(page.locator('#wi-paper-sheet').getByText('Operation Guidance')).toBeVisible();
    await expect(page.locator('#wi-paper-sheet').getByText('CAD / Drawing Preview')).toBeVisible();

    // Verify Right Property Inspector shows Free Size controls
    await page.locator('#wi-paper-sheet').getByText('Operation Guidance').click();
    await expect(page.locator('text=Size & Layout (Free Size)')).toBeVisible();
    await expect(page.locator('text=Lebar Kolom (Presets)')).toBeVisible();

    // Take screenshot of PowerPoint multi-column side-by-side canvas
    await page.screenshot({ path: 'tests/e2e/screenshots/digital-wi-powerpoint-side-by-side.png' });
  });

  test('5. Operator Runtime enforces mandatory checkpoints and progresses steps', async ({ page }) => {
    await page.goto('/#/digital-wi/operator/wi-hc-100-assy?station=Station-ASSY-01');
    await page.waitForLoadState('domcontentloaded');

    // Check kiosk header & Step 1
    await expect(page.locator('text=Step 1 of 4')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('h2:has-text("Component Inspection & Cleanliness Check")')).toBeVisible();

    // Click Next Step BEFORE completing checkpoints - should block and stay on Step 1
    const nextBtn = page.locator('button:has-text("Next Step")');
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Verify we remain on Step 1
    await expect(page.locator('text=Step 1 of 4')).toBeVisible();

    // Simulate scan barcode
    const scanBtn = page.locator('button:has-text("Simulate Scan")');
    if (await scanBtn.isVisible()) {
      await scanBtn.click();
    }

    // Confirm checklist
    const confirmBtn = page.locator('button:has-text("Click / Tap to Confirm Check")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    // Now click Next Step - should successfully advance to Step 2
    await nextBtn.click();
    await expect(page.locator('text=Step 2 of 4')).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: 'tests/e2e/screenshots/digital-wi-operator.png', fullPage: true });
  });

  test('6. Approval Center, Deployments, and Execution History load properly', async ({ page }) => {
    // Approval Center
    await page.goto('/#/digital-wi/approvals');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1:has-text("Approval Center")')).toBeVisible({ timeout: 10000 });

    // Station Deployments
    await page.goto('/#/digital-wi/deployments');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1:has-text("Station Deployment")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Station-ASSY-01').first()).toBeVisible();

    // Execution History
    await page.goto('/#/digital-wi/executions');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1:has-text("Execution Records")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=HC-SN-89410')).toBeVisible();
  });
});
