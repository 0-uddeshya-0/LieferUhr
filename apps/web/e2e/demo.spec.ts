import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Each test gets a fresh browser context, so the in-memory demo store and
  // the persisted language both start clean.
  await page.goto('./');
});

test('landing page renders in German and toggles to English', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ein Konto. Sechs Werkzeuge.');

  await page.getByRole('group', { name: /Sprache/ }).getByRole('button', { name: 'EN' }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('One account. Six tools.');
  await expect(page.getByRole('heading', { name: 'Looking for pilot customers' })).toBeVisible();
});

test('nav demo goes to Einkauf; FrachtRadar section links to its demo', async ({ page }) => {
  // Nav: the blue pill opens the Einkauf demo
  const nav = page.getByRole('navigation');
  await nav.getByRole('link', { name: 'Einkauf-Demo' }).click();
  await expect(page).toHaveURL(/#\/dashboard/);
  await page.goto('./');

  // FrachtRadar product section: demo link points at the nested fleet app
  const section = page.locator('#prod-frachtradar');
  await expect(section.getByRole('link', { name: 'Dispo-Demo öffnen' })).toHaveAttribute('href', /fleet\/$/);
});

test('all six product sections carry a demo video and a demo link', async ({ page }) => {
  const products: [string, RegExp][] = [
    ['einkauf', /#\/dashboard/],
    ['frachtradar', /fleet\/$/],
    ['frachtamt', /suite\/#\/dispatch$/],
    ['pruefamt', /suite\/#\/comply$/],
    ['einsatzamt', /suite\/#\/hvac$/],
    ['postamt', /suite\/#\/depot$/],
  ];
  for (const [id, href] of products) {
    const section = page.locator(`#prod-${id}`);
    await expect(section).toBeVisible();
    const video = section.locator('video');
    await expect(video).toHaveAttribute('preload', 'none');
    await expect(video.locator('source')).toHaveAttribute('src', new RegExp(`videos/${id}\\.mp4$`));
    await expect(section.getByRole('link').first()).toHaveAttribute('href', href);
  }
});

test('footer links every product and the repository', async ({ page }) => {
  const footer = page.locator('footer');
  for (const name of ['Lieferuhr Einkauf', 'FrachtRadar', 'FrachtAmt', 'PrüfAmt', 'EinsatzAmt', 'PostAmt']) {
    await expect(footer.getByRole('link', { name })).toBeVisible();
  }
  await expect(footer.getByRole('link', { name: 'GitHub Repository' })).toHaveAttribute('href', /github\.com/);
});

test('dashboard shows live demo data with risk indicators', async ({ page }) => {
  await page.getByRole('link', { name: 'Dashboard-Demo öffnen' }).first().click();

  await expect(page).toHaveURL(/#\/dashboard/);
  await expect(page.getByText('Aktive Bestellungen')).toBeVisible();
  await expect(page.getByText('Warenwert in Verzug')).toBeVisible();
  await expect(page.getByRole('link', { name: 'PO-2026-118' })).toBeVisible();
  await expect(page.getByText('Kritisch').first()).toBeVisible();
  await expect(page.getByText('Entwicklung der letzten 6 Monate')).toBeVisible();
});

test('creating an order adds it to the dashboard', async ({ page }) => {
  await page.goto('./#/orders/new');

  await page.locator('select').selectOption({ label: 'Elektro Bauer & Co.' });
  await page.getByLabel('Bestellnummer').fill('PO-2026-777');
  await page.getByLabel('Beschreibung').fill('Servomotor 3kW');
  await page.getByLabel('Fälligkeitsdatum').fill('2026-09-01T10:00');
  await page.getByRole('button', { name: 'Bestellung anlegen' }).click();

  await expect(page).toHaveURL(/#\/dashboard/);
  await expect(page.getByRole('link', { name: 'PO-2026-777' })).toBeVisible();
});

test('buyer can mark an order as delivered', async ({ page }) => {
  await page.goto('./#/orders/ord-19');

  await page.locator('select').selectOption('DELIVERED');
  await page.getByRole('button', { name: 'Speichern' }).click();

  await expect(page.getByText('Geliefert').first()).toBeVisible();
});

test('supplier magic-link page accepts a status update with confirmed date', async ({ page }) => {
  await page.goto('./#/s/demo');

  await expect(page.getByText('PO-2026-118')).toBeVisible();
  await page.getByRole('button', { name: 'Versendet' }).click();
  await page.getByLabel(/Bestätigter Liefertermin/).fill('2026-09-01');
  await page.getByRole('button', { name: 'Status senden' }).click();

  await expect(page.getByText('Vielen Dank!')).toBeVisible();
});

test('team page lists members and simulates an invite', async ({ page }) => {
  await page.goto('./#/team');

  await expect(page.getByText('Thomas Müller')).toBeVisible();
  await page.getByLabel('E-Mail').fill('neu@muster.de');
  await page.getByRole('button', { name: 'Einladung senden' }).click();
  await expect(page.getByText('neu@muster.de')).toBeVisible();
});
