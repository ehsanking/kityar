export const MAX_BATCH_ROWS = 200;

export type CsvResult = { ok: true; headers: string[]; rows: Record<string, string>[] } | { ok: false; error: string };

/** RFC 4180 parser: quoted fields, escaped quotes, CRLF/LF, BOM, comma or semicolon delimiter. */
export function parseCsv(input: string): CsvResult {
  const text = input.replace(/^﻿/, '');
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';

  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"' && field === '') quoted = true;
    else if (c === delimiter) {
      record.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      record.push(field);
      records.push(record);
      record = [];
      field = '';
    } else field += c;
  }
  if (quoted) return { ok: false, error: 'فایل CSV یک گیومهٔ بسته‌نشده دارد.' };
  if (field !== '' || record.length) {
    record.push(field);
    records.push(record);
  }

  const nonEmpty = records.filter((r) => r.some((f) => f.trim() !== ''));
  if (nonEmpty.length < 2) return { ok: false, error: 'فایل CSV باید یک سطر عنوان و حداقل یک سطر داده داشته باشد.' };

  const headers = nonEmpty[0].map((h) => h.trim());
  if (headers.some((h) => !h) || new Set(headers.map((h) => h.toLowerCase())).size !== headers.length) {
    return { ok: false, error: 'عنوان ستون‌ها باید غیرخالی و یکتا باشند.' };
  }
  const dataRows = nonEmpty.slice(1);
  if (dataRows.length > MAX_BATCH_ROWS) return { ok: false, error: `حداکثر ${MAX_BATCH_ROWS} سطر در هر بار مجاز است.` };

  const rows = dataRows.map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? '').trim()])));
  return { ok: true, headers, rows };
}
