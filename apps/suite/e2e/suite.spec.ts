import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
});

test('suite home lists four tool doors and toggles language', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toContainText('selbst erledigt');
  for (const name of ['FrachtAmt', 'PrüfAmt', 'EinsatzAmt', 'PostAmt']) {
    await expect(page.getByRole('link', { name: new RegExp(name) })).toBeVisible();
  }

  await page.getByRole('group', { name: /Sprache/ }).getByRole('button', { name: 'EN' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('its own paperwork');
  await expect(page.getByRole('link', { name: /FrachtAmt/ })).toBeVisible();
});

test('dispatch: counter an offer, then book it', async ({ page }) => {
  await page.getByRole('link', { name: /FrachtAmt/ }).click();
  await expect(page).toHaveURL(/#\/dispatch/);

  await page.getByRole('button', { name: 'Gegenangebot' }).click();
  await page.getByRole('button', { name: 'Entwurf übernehmen & kontern' }).click();
  await expect(page.getByRole('heading', { name: /Konter läuft/ })).toContainText('2');

  await page.getByRole('button', { name: 'Annehmen' }).click();
  await expect(page.getByText('Gebucht ✓')).toBeVisible();
  await expect(page.getByText('Rate Confirmation')).toBeVisible();

  await page.getByRole('button', { name: '→ an FrachtRadar übergeben' }).click();
  await expect(page.getByRole('button', { name: /Tour in FrachtRadar angelegt/ })).toBeDisabled();
});

test('comply: driver clocks and document traffic light render', async ({ page }) => {
  await page.getByRole('link', { name: /PrüfAmt/ }).click();
  await expect(page).toHaveURL(/#\/comply/);

  await expect(page.getByText('Fahrer-Uhren')).toBeVisible();
  await expect(page.getByText('Mehmet Yilmaz').first()).toBeVisible();
  await expect(page.getByText('überfällig').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Paket exportieren/ })).toBeVisible();
});

test('hvac: schedule a request from the inbox', async ({ page }) => {
  await page.getByRole('link', { name: /EinsatzAmt/ }).click();
  await expect(page).toHaveURL(/#\/hvac/);

  await page.getByRole('button', { name: /Bäckerei Vogt/ }).click();
  await page.getByRole('button', { name: 'Job anlegen & terminieren' }).click();
  await expect(page.getByText(/Terminiert: Jonas Wolf/)).toBeVisible();
  await expect(page.getByText(/your appointment is confirmed|Ihr Termin ist bestätigt/)).toBeVisible();
});

test('depot: order email becomes order and decrements stock', async ({ page }) => {
  await page.getByRole('link', { name: /PostAmt/ }).click();
  await expect(page).toHaveURL(/#\/depot/);

  await expect(page.getByText('84').first()).toBeVisible(); // EST-25 stock
  await page.getByRole('button', { name: 'Auftrag anlegen' }).click();
  await expect(page.getByText('Auftrag angelegt')).toBeVisible();
  await expect(page.getByText('74')).toBeVisible(); // 84 − 10
  await expect(page.getByText(/A-240\d/)).toBeVisible();
});
