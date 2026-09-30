import { describe, expect, it } from 'vitest';
import { MAX_BATCH_ROWS, parseCsv } from './csv';
import { fillTemplate } from './template';

describe('parseCsv', () => {
  it('parses quotes, escaped quotes, CRLF, BOM and Persian text', () => {
    const r = parseCsv('﻿nام,price\r\n"افزونه ""ویژه""، نسخه ۲",۹۹۰۰۰\r\n\r\nقالب,"1,200"\n'.replace('nام', 'نام'));
    expect(r).toEqual({ ok: true, headers: ['نام', 'price'], rows: [{ نام: 'افزونه "ویژه"، نسخه ۲', price: '۹۹۰۰۰' }, { نام: 'قالب', price: '1,200' }] });
  });

  it('detects semicolon delimiters and fills missing cells', () => {
    const r = parseCsv('name;subtitle\nA');
    expect(r.ok && r.rows).toEqual([{ name: 'A', subtitle: '' }]);
  });

  it.each([
    ['header only', 'name\n'],
    ['unclosed quote', 'name\n"abc'],
    ['duplicate headers', 'name,Name\na,b'],
    ['empty header', 'name,\na,b'],
    ['too many rows', 'name\n' + 'x\n'.repeat(MAX_BATCH_ROWS + 1)],
  ])('rejects %s', (_l, text) => {
    expect(parseCsv(text).ok).toBe(false);
  });
});

describe('fillTemplate', () => {
  it('replaces known tokens case-insensitively and keeps unknown ones', () => {
    expect(fillTemplate('{{ Name }} – {{نام}} {{missing}}', { name: 'A', نام: 'ب' })).toBe('A – ب {{missing}}');
  });
  it('returns text unchanged without tokens', () => {
    expect(fillTemplate('plain', { a: 'b' })).toBe('plain');
  });
});

describe('selectVars', () => {
  it('returns a stable merged object while inputs are unchanged', async () => {
    const { selectVars } = await import('./template');
    const state = { base: { a: '1' }, override: { b: '2' } } as any;
    const first = selectVars(state);
    expect(selectVars(state)).toBe(first);
    expect(first).toEqual({ a: '1', b: '2' });
    expect(selectVars({ ...state, override: { b: '3' } })).not.toBe(first);
  });
});
