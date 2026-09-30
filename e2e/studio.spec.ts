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
  const textColor = dialog.getByLabel('رنگ متن (rgba)');
  await textColor.fill('rgba(255, 0, 0, 1)');
  await textColor.press('Enter');
  await dialog.getByRole('button', { name: 'ذخیره و اعمال' }).click();
  const colors = () =>
    page.evaluate(async () => {
      const { useStudioStore } = await import(/* @vite-ignore */ String('/src/store/index.ts'));
      return Object.values(useStudioStore.getState().canvasLayers).flat().filter((l: any) => l.type === 'text').map((l: any) => l.data?.textColor);
    });
  expect((await colors()).every((c) => c === 'rgba(255, 0, 0, 1)')).toBe(true);
  await page.keyboard.press('Control+z');
  expect((await colors()).some((c) => c !== 'rgba(255, 0, 0, 1)')).toBe(true);
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
test('uploaded custom font is embedded in exports', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'فونت', exact: true }).first().click();
  await page.locator('input[type="file"][accept*=".ttf"]').first().setInputFiles('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf');
  await page.waitForTimeout(800);
  const css = await page.evaluate(async () => {
    const { getFontEmbedCSS } = await import(/* @vite-ignore */ String('/node_modules/.vite/deps/html-to-image.js'));
    return getFontEmbedCSS(document.body);
  });
  
  expect(css).toContain('ZhakitCustomFont');
});
test('uploaded font does not leak into the UI', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'فونت', exact: true }).first().click();
  await page.locator('input[type="file"][accept*=".ttf"]').first().setInputFiles('e2e/fixtures/wide-space.ttf');
  await page.waitForTimeout(800);
  const fonts = await page.evaluate(() => ({
    uiButton: getComputedStyle(document.querySelector('header button')!).fontFamily,
    canvas: getComputedStyle(document.querySelector('[data-layer-id]')!).fontFamily,
  }));
  expect(fonts.uiButton).not.toContain('ZhakitCustomFont');
  expect(fonts.canvas).toContain('ZhakitCustomFont');
});

test('colour picker stores rgba with transparency and is not hidden behind panels', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const name = await page.evaluate(async () => {
    const { useStudioStore } = await import(/* @vite-ignore */ String('/src/store/index.ts'));
    return useStudioStore.getState().canvasLayers.cover400.find((l: any) => l.type === 'text').name;
  });
  await page.getByText(name, { exact: true }).first().click();
  const insp = page.locator('.PhotoshopLayerInspector').first();
  const sw = insp.locator('button[aria-expanded]').first();
  await sw.scrollIntoViewIfNeeded();
  await sw.click();
  await expect(page.locator('[role="dialog"] .react-colorful').first()).toBeVisible();
  const bb = (await page.locator('[role="dialog"]').first().boundingBox())!;
  const onTop = await page.evaluate(({ x, y }) => !!document.elementFromPoint(x, y)?.closest('[role="dialog"]'), { x: bb.x + bb.width / 2, y: bb.y + bb.height - 30 });
  expect(onTop).toBe(true);
  // drag the alpha slider to the middle and check an rgba value with alpha < 1 reaches the store
  const alpha = page.locator('[role="dialog"] .react-colorful__alpha').first();
  const b = (await alpha.boundingBox())!;
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  const color = await page.evaluate(async (n) => {
    const { useStudioStore } = await import(/* @vite-ignore */ String('/src/store/index.ts'));
    return useStudioStore.getState().canvasLayers.cover400.find((l: any) => l.name === n).data.textColor;
  }, name);
  expect(color).toMatch(/^rgba\(\d+, \d+, \d+, 0\.\d+\)$/);
});

// Report elements whose box sticks out of the nearest clipping/scrolling ancestor or the viewport.
const audit = (page: Page, label: string) => page.evaluate((label) => {
  const out: string[] = [];
  const vw = document.documentElement.clientWidth;
  for (const el of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' || cs.visibility === 'hidden') continue;
    let p = el.parentElement, box: DOMRect | null = null;
    while (p && p !== document.body) {
      const ps = getComputedStyle(p);
      if (/(hidden|auto|scroll|clip)/.test(ps.overflowX) || ps.position === 'fixed') { box = p.getBoundingClientRect(); break; }
      p = p.parentElement;
    }
    const left = box ? box.left : 0, right = box ? box.right : vw;
    if (r.left < left - 2 || r.right > right + 2) {
      const txt = (el.innerText || el.getAttribute('aria-label') || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40);
      out.push(`${label} | ${Math.round(r.left)}-${Math.round(r.right)} in ${Math.round(left)}-${Math.round(right)} | ${txt}`);
    }
  }
  return out;
}, label);


test('no UI element spills out of its panel at 125% scaling', async ({ page }) => {
  await page.setViewportSize({ width: 1504, height: 771 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const all: string[] = [];
  all.push(...await audit(page, 'studio'));
  for (const tab of ['لایه‌ها','بج و استیکر','لوگو و کادر','گرادیانت','فونت','تصاویر','هوش مصنوعی','طراحی آزاد','نمودار']) {
    const b = page.getByRole('button', { name: tab, exact: true }).first();
    if (await b.count()) { await b.click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(1200); all.push(...await audit(page, 'tab:' + tab)); }
  }
  await page.getByRole('button', { name: 'لایه‌ها', exact: true }).first().click();
  await page.getByRole('button', { name: /آیکون/ }).first().click();
  await page.waitForTimeout(600);
  all.push(...await audit(page, 'iconModal'));
  // Off-screen export stages (x < -1000) are intentional; SVG ruler glyphs may touch edges.
  const real = [...new Set(all)].filter((l) => !/ -\d{4}/.test(l) && !/\| (svg|g|text)$/.test(l));
  expect(real).toEqual([]);
});
