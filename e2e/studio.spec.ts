import { readFileSync } from 'fs';
import { expect, test, type Page } from '@playwright/test';
import { getInitialTemplateLayers } from '../src/data/studioTemplates';

const MARK = 'E2E-LAYER';

const readSavedDocument = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<{ saved: string | null; legacy: string | null }>((resolve) => {
        const req = indexedDB.open('kityar');
        req.onsuccess = () => {
          const get = req.result.transaction('documents').objectStore('documents').get('studio_document');
          get.onsuccess = () =>
            resolve({ saved: get.result ? JSON.stringify(get.result) : null, legacy: localStorage.getItem('zhaket_studio_layers_v2') });
        };
      }),
  );

test.beforeEach(async ({ page }) => {
  const layers = getInitialTemplateLayers();
  layers.cover400.find((l) => l.type !== 'background')!.name = MARK;
  // Seed legacy (v2) localStorage data once per test to exercise migration.
  await page.addInitScript((seed) => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.clear();
    indexedDB.deleteDatabase('kityar');
    localStorage.setItem('zhaket_studio_layers_v2', seed);
    sessionStorage.setItem('seeded', '1');
  }, JSON.stringify(layers));
});

test('migrates legacy data, deletes, undoes/redoes and persists across reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/', { waitUntil: 'networkidle' });
  const layer = page.getByText(MARK, { exact: true });
  await expect(layer.first()).toBeVisible();

  await layer.first().click();
  await page.locator('body').press('Delete');
  await expect(layer).toHaveCount(0);

  await expect.poll(async () => (await readSavedDocument(page)).saved?.includes(MARK), { timeout: 5_000 }).toBe(false);
  expect((await readSavedDocument(page)).legacy).toBeNull();

  await page.keyboard.press('Control+z');
  await expect(layer.first()).toBeVisible();
  await page.keyboard.press('Control+Shift+z');
  await expect(layer).toHaveCount(0);
  await page.keyboard.press('Control+z');
  await expect.poll(async () => (await readSavedDocument(page)).saved?.includes(MARK), { timeout: 5_000 }).toBe(true);

  await page.reload({ waitUntil: 'networkidle' });
  await expect(layer.first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('rejects an invalid project file with an error toast', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('input[type="file"][accept*="json"]').first().setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ productName: 'no layers' })),
  });
  await expect(page.getByText('فایل هیچ لایه یا دادهٔ طراحی معتبری ندارد', { exact: false })).toBeVisible();
  await expect(page.getByText(MARK, { exact: true }).first()).toBeVisible();
});

test('compliance tab measures the live canvas and reports a real score', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'بررسی استاندارد مارکت‌پلیس' }).click();
  await expect(page.getByText(/امتیاز .* از ۱۰۰/)).toBeVisible();
  const items = page.getByRole('list', { name: 'نتایج بررسی استاندارد' }).getByRole('listitem');
  await expect(items.first()).toBeVisible();
  expect(await page.getByText('بوم به‌جز پس‌زمینه هیچ محتوایی ندارد').count()).toBe(0);
});

test('batch CSV export renders each row into its own folder in one ZIP', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  // Put a template token into the migrated layer so rows change visible text.
  await page.evaluate(async () => {
    const { useStudioStore } = await import(/* @vite-ignore */ String('/src/store/index.ts'));
    useStudioStore.getState().setCanvasLayers((m: any) => ({
      ...m,
      cover400: m.cover400.map((l: any) => (l.name === 'E2E-LAYER' ? { ...l, type: 'text', data: { ...l.data, text: 'محصول {{name}}' } } : l)),
    }));
  });
  const download = page.waitForEvent('download', { timeout: 60_000 });
  await page.getByLabel('فایل CSV تولید دسته‌ای').setInputFiles({
    name: 'rows.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('name,price\nآلفا,100\nبتا,200\n'),
  });
  const file = await (await download).path();
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(readFileSync(file));
  const folders = new Set(Object.keys(zip.files).map((p) => p.split('/')[0]));
  expect([...folders].sort()).toEqual(['آلفا', 'بتا']);
  expect(Object.keys(zip.files).some((p) => p.endsWith('.png'))).toBe(true);
  // Override is cleared afterwards: the token is shown again, not the last row.
  await expect(page.getByText('محصول بتا')).toHaveCount(0);
});

test('brand kit applies text colour to text layers and is undoable', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'کیت برند' }).click();
  const dialog = page.getByRole('dialog', { name: 'کیت برند' });
  await dialog.getByLabel('رنگ متن').fill('#ff0000');
  await dialog.getByRole('button', { name: 'ذخیره و اعمال' }).click();
  const colors = () =>
    page.evaluate(async () => {
      const { useStudioStore } = await import(/* @vite-ignore */ String('/src/store/index.ts'));
      return Object.values(useStudioStore.getState().canvasLayers).flat().filter((l: any) => l.type === 'text').map((l: any) => l.data?.textColor);
    });
  expect((await colors()).every((c) => c === '#ff0000')).toBe(true);
  await page.keyboard.press('Control+z');
  expect((await colors()).some((c) => c !== '#ff0000')).toBe(true);
});

test('AI tab generates a vector, sanitizes it and adds it to the canvas', async ({ page }) => {
  let called = 0;
  await page.route('**/api/generate-vector-svg', async (route) => {
    called++;
    await route.fulfill({
      json: { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" onload="window.__pwned=1"><script>window.__pwned=1</script><circle id="ai-dot" cx="5" cy="5" r="4"/></svg>' },
    });
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'هوش مصنوعی' }).click();
  await page.getByPlaceholder(/نشان لایسنس طلایی/).fill('rocket badge');
  await page.getByRole('button', { name: 'تولید با AI' }).click();
  await page.getByRole('button', { name: 'افزودن این المان به لایه‌های بوم' }).click();

  expect(called).toBe(1);
  await expect(page.locator('#ai-dot').first()).toBeAttached();
  expect(await page.evaluate(() => (window as any).__pwned)).toBeUndefined();
  expect(await page.locator('svg[onload], svg script').count()).toBe(0);
});

test('free-form Konva tab sends a shape to the main canvas; chart tab renders', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const layerCount = () =>
    page.evaluate(async () => {
      const { useStudioStore } = await import(/* @vite-ignore */ String('/src/store/index.ts'));
      return Object.values(useStudioStore.getState().canvasLayers).flat().length;
    });
  const before = await layerCount();

  await page.getByRole('button', { name: 'طراحی آزاد' }).click();
  await page.getByTitle('مربع/مستطیل').click();
  await page.getByRole('button', { name: 'انتقال به بوم اصلی ژاکت' }).click();
  await expect.poll(layerCount).toBe(before + 1);

  await page.getByRole('button', { name: 'نمودار', exact: true }).click();
  await expect(page.getByText('نمودار تحلیل و ویژگی‌های محصول')).toBeVisible();
  await expect(page.locator('.recharts-surface').first()).toBeVisible();
});
