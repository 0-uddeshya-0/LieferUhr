import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
});

test('suite home lists three core tools plus the experiment and toggles language', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toContainText('vorbereitet');
  for (const name of ['FrachtAmt', 'PrüfAmt', 'PostAmt']) {
    await expect(page.locator('main').getByRole('link', { name: new RegExp(name) })).toBeVisible();
  }
  // EinsatzAmt stays reachable but is demoted to the experiment row.
  await expect(page.locator('main').getByRole('link', { name: /EinsatzAmt/ })).toBeVisible();
  await expect(page.locator('main').getByText('Experiment').first()).toBeVisible();

  await page.getByRole('group', { name: /Sprache/ }).getByRole('button', { name: 'EN' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('prepared and done');
  await expect(page.locator('main').getByRole('link', { name: /FrachtAmt/ })).toBeVisible();
});

test('frachtamt: counter an offer, then book it', async ({ page }) => {
  await page.locator('main').getByRole('link', { name: /FrachtAmt/ }).click();
  await expect(page).toHaveURL(/#\/frachtamt/);

  await page.getByRole('button', { name: 'Gegenangebot' }).click();
  await page.getByRole('button', { name: 'Entwurf übernehmen & kontern' }).click();
  await expect(page.getByRole('heading', { name: /Konter läuft/ })).toContainText('2');

  await page.getByRole('button', { name: 'Annehmen' }).click();
  await expect(page.getByText('Gebucht ✓')).toBeVisible();
  await expect(page.getByText('Rate Confirmation')).toBeVisible();

  await page.getByRole('button', { name: '→ an FrachtRadar übergeben' }).click();
  await expect(page.getByRole('button', { name: /Übergabe an FrachtRadar vorgemerkt/ })).toBeDisabled();
});

test('pruefamt: driver clocks, traffic light and a real export file', async ({ page }) => {
  await page.locator('main').getByRole('link', { name: /PrüfAmt/ }).click();
  await expect(page).toHaveURL(/#\/pruefamt/);

  await expect(page.getByText('Fahrer-Uhren')).toBeVisible();
  await expect(page.getByText('Mehmet Yilmaz').first()).toBeVisible();
  await expect(page.getByText('überfällig').first()).toBeVisible();

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /Paket exportieren/ }).click();
  expect((await download).suggestedFilename()).toBe('kontroll-paket.txt');
});

test('einsatzamt: schedule a request from the inbox', async ({ page }) => {
  await page.locator('main').getByRole('link', { name: /EinsatzAmt/ }).click();
  await expect(page).toHaveURL(/#\/einsatzamt/);

  await page.getByRole('button', { name: /Bäckerei Vogt/ }).click();
  await page.getByRole('button', { name: 'Job anlegen & terminieren' }).click();
  await expect(page.getByText(/Terminiert: Jonas Wolf/)).toBeVisible();
  await expect(page.getByText(/your appointment is confirmed|Ihr Termin ist bestätigt/)).toBeVisible();
});

test('postamt: order email becomes order and decrements stock', async ({ page }) => {
  await page.locator('main').getByRole('link', { name: /PostAmt/ }).click();
  await expect(page).toHaveURL(/#\/postamt/);

  await expect(page.getByText('84').first()).toBeVisible(); // EST-25 stock
  await page.getByRole('button', { name: 'Auftrag anlegen' }).click();
  await expect(page.getByText('Auftrag angelegt')).toBeVisible();
  await expect(page.getByText('74')).toBeVisible(); // 84 − 10
  await expect(page.getByText(/A-240\d/)).toBeVisible();
});

test('legacy slugs redirect to the product names', async ({ page }) => {
  await page.goto('./#/depot');
  await expect(page).toHaveURL(/#\/postamt/);
  await page.goto('./#/dispatch');
  await expect(page).toHaveURL(/#\/frachtamt/);
});
