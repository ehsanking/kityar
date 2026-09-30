// Shared AI generation API used by both the dev/web server (server.ts)
// and the embedded Electron server (electron.js). Keep provider logic here only.
import express from 'express';
import { GoogleGenAI } from '@google/genai';

export const MODELS = {
  claude: 'claude-sonnet-5-5',
  openaiText: 'gpt-4o-mini',
  openaiImage: 'dall-e-3',
  geminiText: 'gemini-3.8-flash',
  geminiImage: 'gemini-3.1-flash-lite-image',
};

const MAX_PROMPT_LENGTH = 4000;
const MAX_STYLE_LENGTH = 200;
const ALLOWED_ASPECT_RATIOS = new Set(['1:1', '3:4', '4:3', '9:16', '16:9']);
const UPSTREAM_TIMEOUT_MS = 90_000;

const SYSTEM_INSTRUCTION_SVG = `You are an expert SVG vector graphic designer for Persian e-commerce product covers and banners (Zhaket marketplace).
Given the user's creative prompt, generate a clean, modern, standalone SVG vector code snippet.
Requirements:
1. Return ONLY the valid <svg viewBox="0 0 500 500" ...> ... </svg> code block.
2. Use modern colors, smooth gradients (defined inside <defs>), and clean scalable paths/shapes.
3. No markdown text outside the code block, no HTML wrappers, no <script>, no event handler attributes, no external references, only pristine SVG.
4. Make it visually striking, suitable as an overlay element, badge, abstract shape, 3D-like isometric graphic, or tech icon.`;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const svgUserPrompt = (prompt, style) =>
  `Create a creative vector SVG element for: ${prompt}. Style: ${style}`;

function extractSvg(rawText) {
  const match = rawText.match(/<svg[\s\S]*?<\/svg>/i);
  if (!match) throw new HttpError(502, 'مدل خروجی SVG معتبری برنگرداند.');
  return match[0];
}

async function postJson(url, headers, body, providerName) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new HttpError(502, data?.error?.message || `${providerName} returned status ${response.status}`);
  }
  return data;
}

async function claudeText(apiKey, userContent, system) {
  const data = await postJson(
    'https://api.anthropic.com/v1/messages',
    { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    {
      model: MODELS.claude,
      max_tokens: 4000,
      ...(system ? { system } : {}),
      messages: [{ role: 'user', content: userContent }],
    },
    'Claude API',
  );
  return data.content?.find((b) => b.type === 'text')?.text || '';
}

async function openaiText(apiKey, userContent, system) {
  const messages = system
    ? [{ role: 'system', content: system }, { role: 'user', content: userContent }]
    : [{ role: 'user', content: userContent }];
  const data = await postJson(
    'https://api.openai.com/v1/chat/completions',
    { Authorization: `Bearer ${apiKey}` },
    { model: MODELS.openaiText, messages },
    'OpenAI API',
  );
  return data.choices?.[0]?.message?.content || '';
}

async function openaiImage(apiKey, prompt) {
  const data = await postJson(
    'https://api.openai.com/v1/images/generations',
    { Authorization: `Bearer ${apiKey}` },
    { model: MODELS.openaiImage, prompt, n: 1, size: '1024x1024', response_format: 'b64_json' },
    'OpenAI Images API',
  );
  const b64 = data.data?.[0]?.b64_json;
  return b64 ? `data:image/png;base64,${b64}` : null;
}

async function geminiText(apiKey, contents, systemInstruction) {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODELS.geminiText,
    contents,
    ...(systemInstruction ? { config: { systemInstruction } } : {}),
  });
  return response.text || '';
}

async function geminiImage(apiKey, prompt, aspectRatio) {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODELS.geminiImage,
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio } },
  });
  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData?.data) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }
  return null;
}

function readHeader(req, name) {
  const value = req.headers[name];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readString(value, field, maxLength, { required = false, fallback } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new HttpError(400, `${field} is required`);
    return fallback;
  }
  if (typeof value !== 'string') throw new HttpError(400, `${field} must be a string`);
  const trimmed = value.trim();
  if (required && !trimmed) throw new HttpError(400, `${field} is required`);
  if (trimmed.length > maxLength) throw new HttpError(400, `${field} is too long (max ${maxLength})`);
  return trimmed;
}

/** Simple fixed-window in-memory rate limiter keyed by client IP. */
function createRateLimiter({ windowMs, max }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    let entry = hits.get(key);
    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (hits.size > 10_000) {
      for (const [k, v] of hits) if (now >= v.resetAt) hits.delete(k);
    }
    if (entry.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ error: 'تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.' });
    }
    next();
  };
}

/**
 * @param {object} [options]
 * @param {string} [options.serverGeminiKey] Fallback Gemini key used when the client sends none.
 *   Only set this for trusted/local deployments: anyone who can reach the server spends its quota.
 * @param {{windowMs:number,max:number}} [options.rateLimit]
 */
export function createAiRouter({ serverGeminiKey, rateLimit = { windowMs: 60_000, max: 20 } } = {}) {
  const router = express.Router();
  router.use(express.json({ limit: '32kb' }));
  router.use(createRateLimiter(rateLimit));

  const keysFrom = (req) => ({
    gemini: readHeader(req, 'x-gemini-key') || serverGeminiKey,
    openai: readHeader(req, 'x-openai-key'),
    claude: readHeader(req, 'x-claude-key'),
  });

  const handle = (fn) => async (req, res) => {
    try {
      res.json(await fn(req));
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      if (status >= 500) console.error(`[ai] ${req.path} failed:`, error?.message || error);
      res.status(status).json({ error: error?.message || 'Internal error' });
    }
  };

  router.post('/generate-vector-svg', handle(async (req) => {
    const prompt = readString(req.body?.prompt, 'prompt', MAX_PROMPT_LENGTH, { required: true });
    const style = readString(req.body?.style, 'style', MAX_STYLE_LENGTH, { fallback: 'modern flat' });
    const keys = keysFrom(req);
    const userContent = svgUserPrompt(prompt, style);

    let rawText;
    if (keys.claude) rawText = await claudeText(keys.claude, userContent, SYSTEM_INSTRUCTION_SVG);
    else if (keys.openai) rawText = await openaiText(keys.openai, userContent, SYSTEM_INSTRUCTION_SVG);
    else if (keys.gemini) rawText = await geminiText(keys.gemini, userContent, SYSTEM_INSTRUCTION_SVG);
    else throw new HttpError(400, 'هیچ کلید API معتبری (Gemini، OpenAI یا Claude) وارد نشده است.');

    return { svg: extractSvg(rawText), prompt };
  }));

  router.post('/generate-image', handle(async (req) => {
    const prompt = readString(req.body?.prompt, 'prompt', MAX_PROMPT_LENGTH, { required: true });
    const aspectRatio = readString(req.body?.aspectRatio, 'aspectRatio', 10, { fallback: '1:1' });
    if (!ALLOWED_ASPECT_RATIOS.has(aspectRatio)) throw new HttpError(400, 'Unsupported aspectRatio');
    const keys = keysFrom(req);

    let imageUrl;
    if (keys.openai) imageUrl = await openaiImage(keys.openai, prompt);
    else if (keys.gemini) imageUrl = await geminiImage(keys.gemini, prompt, aspectRatio);
    else throw new HttpError(400, 'کلید Gemini یا OpenAI برای تصویرسازی وارد نشده است.');

    if (!imageUrl) throw new HttpError(502, 'مدل هیچ تصویری برنگرداند.');
    return { imageUrl };
  }));

  router.post('/generate-content', handle(async (req) => {
    const prompt = readString(req.body?.prompt, 'prompt', MAX_PROMPT_LENGTH, { required: true });
    const keys = keysFrom(req);

    let text;
    if (keys.claude) text = await claudeText(keys.claude, prompt);
    else if (keys.openai) text = await openaiText(keys.openai, prompt);
    else if (keys.gemini) text = await geminiText(keys.gemini, prompt);
    else throw new HttpError(400, 'کلید معتبر وارد نشده است.');

    return { text };
  }));

  return router;
}
