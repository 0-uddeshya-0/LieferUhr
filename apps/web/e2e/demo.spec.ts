import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Each test gets a fresh browser context, so the in-memory demo store and
  // the persisted language both start clean.
  await page.goto('./');
});

test('landing page renders in German and toggles to English', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Weniger telefonieren.');

  await page.getByRole('group', { name: /Sprache/ }).getByRole('button', { name: 'EN' }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Less phoning.');
  await expect(page.getByRole('heading', { name: 'Looking for pilot customers' })).toBeVisible();
});

test('self-selection strip offers the two clusters', async ({ page }) => {
  const strip = page.locator('#werke');
  await expect(strip.getByRole('link', { name: /Fuhrunternehmen 3–30 LKW/ })).toBeVisible();
  await expect(strip.getByRole('link', { name: /Einkauf & Handel/ })).toBeVisible();

  await strip.getByRole('link', { name: /Fuhrunternehmen 3–30 LKW/ }).click();
  await expect(page.locator('#fracht')).toBeInViewport();
  await expect(page).toHaveURL(/#\/$|\/$/);
});

test('cluster sections order products by workflow and carry videos', async ({ page }) => {
  // Carrier cluster: FrachtAmt → FrachtRadar → PrüfAmt
  const fracht = page.locator('#fracht');
  for (const id of ['frachtamt', 'frachtradar', 'pruefamt']) {
    await expect(fracht.locator(`#prod-${id}`)).toBeVisible();
  }
  // Goods cluster: Einkauf → PostAmt
  const handel = page.locator('#handel');
  for (const id of ['einkauf', 'postamt']) {
    await expect(handel.locator(`#prod-${id}`)).toBeVisible();
  }
  // EinsatzAmt is dropped from the suite story — not on the landing page.
  await expect(page.locator('#prod-einsatzamt')).toHaveCount(0);

  const products: [string, RegExp][] = [
    ['einkauf', /#\/dashboard/],
    ['frachtradar', /fleet\/#\/dispatch$/],
    ['frachtamt', /suite\/#\/frachtamt$/],
    ['pruefamt', /suite\/#\/pruefamt$/],
    ['postamt', /suite\/#\/postamt$/],
  ];
  for (const [id, href] of products) {
    const section = page.locator(`#prod-${id}`);
    const video = section.locator('video');
    await expect(video).toHaveAttribute('preload', 'none');
    await expect(video.locator('source')).toHaveAttribute('src', new RegExp(`videos/${id}\\.mp4$`));
    await expect(section.getByRole('link').first()).toHaveAttribute('href', href);
  }
});

test('nav anchors scroll in place instead of routing', async ({ page }) => {
  // Under HashRouter, href="#x" would be parsed as a route — nav must scroll.
  const nav = page.locator('nav[aria-label="Primary"]');
  await nav.getByRole('link', { name: 'Integration' }).click();
  await expect(page.locator('#integration')).toBeInViewport();
  await expect(page).toHaveURL(/#\/$|\/$/); // hash stays a route, not '#integration'

  await nav.getByRole('link', { name: 'Fuhrunternehmen' }).click();
  await expect(page.locator('#fracht')).toBeInViewport();
});

test('flow chains show the two real product handoffs', async ({ page }) => {
  const flow = page.locator('#zusammen');
  await expect(flow.getByText('an FrachtRadar').first()).toBeVisible();
  await expect(flow.getByText('Termin beim Kunden')).toBeVisible();
  await expect(flow.getByText(/Der Termin gehört beiden Seiten/)).toBeVisible();
});

test('footer links every product and the repository', async ({ page }) => {
  const footer = page.locator('footer');
  for (const name of ['Lieferuhr Einkauf', 'FrachtRadar', 'FrachtAmt', 'PrüfAmt', 'PostAmt']) {
    await expect(footer.getByRole('link', { name })).toBeVisible();
  }
  await expect(footer.getByRole('link', { name: 'GitHub Repository' })).toHaveAttribute('href', /github\.com/);
  await expect(footer.getByText(/uddeshyasingh\.de@gmail\.com/)).toBeVisible();
});

test('dashboard shows live demo data with risk indicators', async ({ page }) => {
  await page.goto('./#/dashboard');

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
