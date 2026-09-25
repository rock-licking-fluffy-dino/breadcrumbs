// POST /api/import-recipe  { "url": "https://..." }
//
// A browser can't read another site's HTML (CORS), so this Vercel function
// fetches the page and hands back just the recipe. It must stay POST: the
// service worker serves every same-origin GET cache-first, and ignores
// anything else.
//
// Always answers JSON:
//   { ok: true, recipe: { name, servings, ingredients, sourceUrl, siteName } }
//   { ok: false, reason: 'invalid-url' | 'blocked' | 'timeout' | 'fetch-failed' | 'not-a-recipe' }

import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { extractRecipeFromHtml } from '../src/lib/extractRecipe.js';

const MAX_URL_LENGTH = 2000;
const MAX_BYTES = 3 * 1024 * 1024;
const TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 5;
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const STATUS = { 'invalid-url': 400, blocked: 403, 'not-a-recipe': 422, timeout: 502, 'fetch-failed': 502 };

class ImportError extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
}

// Private, loopback, link-local and other non-public IPv4 ranges.
const isPrivateIPv4 = (ip) => {
  const [a, b] = ip.split('.').map(Number);
  return a === 0 || a === 10 || a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224;
};

const isPrivateIPv6 = (ip) => {
  const lower = ip.toLowerCase();
  if (lower === '::' || lower === '::1') return true;
  // IPv4-mapped (::ffff:7f00:1 or ::ffff:127.0.0.1) — judge the IPv4 inside.
  const mapped = lower.match(/^::ffff:(?:(\d+\.\d+\.\d+\.\d+)|([0-9a-f]{1,4}):([0-9a-f]{1,4}))$/);
  if (mapped) {
    if (mapped[1]) return isPrivateIPv4(mapped[1]);
    const hi = parseInt(mapped[2], 16);
    const lo = parseInt(mapped[3], 16);
    return isPrivateIPv4(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
  }
  const first = parseInt(lower.split(':')[0] || '0', 16);
  return (first & 0xfe00) === 0xfc00 || // fc00::/7
    (first & 0xffc0) === 0xfe80 ||      // fe80::/10
    (first & 0xff00) === 0xff00;        // multicast
};

const isPrivateAddress = (ip) => (isIP(ip) === 4 ? isPrivateIPv4(ip) : isIP(ip) === 6 ? isPrivateIPv6(ip) : true);

// Throws invalid-url or blocked; returns the parsed URL.
const checkUrl = async (text) => {
  if (typeof text !== 'string' || !text.trim() || text.length > MAX_URL_LENGTH) throw new ImportError('invalid-url');
  let url;
  try { url = new URL(text.trim()); } catch (e) { throw new ImportError('invalid-url'); }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new ImportError('invalid-url');

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (!host) throw new ImportError('invalid-url');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new ImportError('blocked');
  }
  if (isIP(host)) {
    if (isPrivateAddress(host)) throw new ImportError('blocked');
    return url;
  }
  // A public-looking name that resolves to a private address is blocked too.
  let addresses;
  try {
    addresses = await lookup(host, { all: true });
  } catch (e) {
    throw new ImportError('fetch-failed');
  }
  if (!addresses.length || addresses.some(a => isPrivateAddress(a.address))) throw new ImportError('blocked');
  return url;
};

// Reads at most MAX_BYTES of the body, then stops.
const readCapped = async (response) => {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (total < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  reader.cancel().catch(() => {});
  const bytes = new Uint8Array(Math.min(total, MAX_BYTES));
  let offset = 0;
  for (const chunk of chunks) {
    const room = bytes.length - offset;
    if (room <= 0) break;
    bytes.set(chunk.subarray(0, room), offset);
    offset += Math.min(chunk.byteLength, room);
  }
  return new TextDecoder('utf-8').decode(bytes);
};

// Redirects are followed by hand so every hop gets the same checks.
const fetchPage = async (startUrl, signal) => {
  let url = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let response;
    try {
      response = await fetch(url, {
        redirect: 'manual',
        signal,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-GB,en;q=0.9'
        }
      });
    } catch (e) {
      throw new ImportError(signal.aborted ? 'timeout' : 'fetch-failed');
    }
    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
      let next;
      try { next = new URL(response.headers.get('location'), url); } catch (e) { throw new ImportError('fetch-failed'); }
      url = await checkUrl(next.toString());
      continue;
    }
    if (!response.ok) throw new ImportError('fetch-failed');
    try {
      return { html: await readCapped(response), finalUrl: url.toString() };
    } catch (e) {
      throw new ImportError(signal.aborted ? 'timeout' : 'fetch-failed');
    }
  }
  throw new ImportError('fetch-failed');
};

const readBody = (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return {};
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, reason: 'invalid-url' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = await checkUrl(readBody(req).url);
    const { html, finalUrl } = await fetchPage(url, controller.signal);
    const result = extractRecipeFromHtml(html, finalUrl);
    return res.status(result.ok ? 200 : STATUS[result.reason]).json(result);
  } catch (error) {
    const reason = error instanceof ImportError ? error.reason : 'fetch-failed';
    return res.status(STATUS[reason]).json({ ok: false, reason });
  } finally {
    clearTimeout(timer);
  }
}
