// ── Recipe extraction ─────────────────────────────────────────────────────
// Reads the schema.org Recipe that most recipe sites publish as JSON-LD for
// Google, and keeps only what Breadcrumbs stores: the name, the servings, the
// raw ingredient lines and the method. Images, nutrition and the rest stay
// on the source page, which the recipe links back to.
//
// Pure: no network, no dependencies. Shared by the /api/import-recipe
// function and its tests.

import { MAX_METHOD_LENGTH } from './splitMethod.js';

const MAX_NAME_LENGTH = 100;
const MAX_INGREDIENTS = 60;

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  frac12: '½', frac14: '¼', frac34: '¾', frac13: '⅓', frac23: '⅔', frac18: '⅛',
  frac38: '⅜', frac58: '⅝', frac78: '⅞', frac15: '⅕', frac16: '⅙',
  deg: '°', times: '×', divide: '÷', frasl: '⁄', middot: '·', bull: '•',
  ndash: '–', mdash: '—', hellip: '…', minus: '−',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', sbquo: '‚', bdquo: '„',
  laquo: '«', raquo: '»', prime: '′', Prime: '″',
  copy: '©', reg: '®', trade: '™', pound: '£', euro: '€', cent: '¢', yen: '¥',
  agrave: 'à', aacute: 'á', acirc: 'â', atilde: 'ã', auml: 'ä', aring: 'å', aelig: 'æ',
  ccedil: 'ç', egrave: 'è', eacute: 'é', ecirc: 'ê', euml: 'ë',
  igrave: 'ì', iacute: 'í', icirc: 'î', iuml: 'ï', ntilde: 'ñ',
  ograve: 'ò', oacute: 'ó', ocirc: 'ô', otilde: 'õ', ouml: 'ö', oslash: 'ø',
  ugrave: 'ù', uacute: 'ú', ucirc: 'û', uuml: 'ü', yacute: 'ý', yuml: 'ÿ', szlig: 'ß',
  Agrave: 'À', Aacute: 'Á', Acirc: 'Â', Auml: 'Ä', Ccedil: 'Ç', Egrave: 'È', Eacute: 'É',
  Ecirc: 'Ê', Iacute: 'Í', Ntilde: 'Ñ', Oacute: 'Ó', Ouml: 'Ö', Uacute: 'Ú', Uuml: 'Ü'
};

const decodeOnce = (text) => text.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, body) => {
  if (body[0] === '#') {
    const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
    if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return match;
    try { return String.fromCodePoint(code); } catch (e) { return match; }
  }
  return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, body) ? NAMED_ENTITIES[body] : match;
});

// Named, decimal and hex entities. Some sites encode twice ("&amp;#39;"),
// so a second pass runs when the first one changed something.
const decodeEntities = (text) => {
  const once = decodeOnce(text);
  return once === text ? once : decodeOnce(once);
};

// Decode, strip tags, collapse whitespace.
const cleanText = (value) => {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  return decodeEntities(String(value))
    .replace(/<[^>]*>/g, '')
    .replace(/[\s ]+/g, ' ')
    .trim();
};

const isRecipeType = (type) => {
  const types = Array.isArray(type) ? type : [type];
  return types.some(t => typeof t === 'string' && /(^|[/:])Recipe$/.test(t.trim()));
};

// JSON-LD blocks, parsed. A block that doesn't parse is skipped.
const readJsonLdBlocks = (html) => {
  const blocks = [];
  const re = /<script\b[^>]*\btype\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script\s*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1]
      .trim()
      .replace(/^(?:<!--|\/\/\s*<!\[CDATA\[)\s*/, '')
      .replace(/\s*(?:-->|\/\/\s*\]\]>)$/, '');
    if (!raw) continue;
    try {
      blocks.push(JSON.parse(raw));
    } catch (e) {
      // Some sites leave raw line breaks inside strings, which JSON forbids.
      try { blocks.push(JSON.parse(raw.replace(/[\r\n\t]+/g, ' '))); } catch (e2) { /* skip it */ }
    }
  }
  return blocks;
};

// Breadth-first, so a top-level Recipe wins over one nested deeper. Arrays
// and @graph don't count as a level; mainEntity and friends do.
const findRecipe = (roots) => {
  let queue = roots.map(node => ({ node, depth: 0 }));
  const seen = new Set();
  while (queue.length) {
    const next = [];
    for (const { node, depth } of queue) {
      if (!node || typeof node !== 'object' || seen.has(node)) continue;
      seen.add(node);
      if (Array.isArray(node)) {
        node.forEach(child => next.push({ node: child, depth }));
        continue;
      }
      if (isRecipeType(node['@type'])) return node;
      if (Array.isArray(node['@graph'])) node['@graph'].forEach(child => next.push({ node: child, depth }));
      if (depth < 2) {
        Object.entries(node).forEach(([key, value]) => {
          if (key !== '@graph' && value && typeof value === 'object') next.push({ node: value, depth: depth + 1 });
        });
      }
    }
    queue = next;
  }
  return null;
};

// The first whole number anywhere in recipeYield, clamped to 1–50.
const readServings = (recipeYield) => {
  const values = Array.isArray(recipeYield) ? recipeYield : [recipeYield];
  for (const value of values) {
    if (typeof value !== 'string' && typeof value !== 'number') continue;
    const m = cleanText(value).match(/\d+/);
    if (m) return Math.min(50, Math.max(1, parseInt(m[0], 10)));
  }
  return null;
};

// "For the sauce:" or "FOR THE SAUCE" — a heading, not something to buy.
const isSectionHeader = (line) =>
  /:$/.test(line) || (/[A-Z]/.test(line) && line === line.toUpperCase() && !/\d/.test(line));

const readIngredients = (recipe) => {
  let raw = recipe.recipeIngredient !== undefined ? recipe.recipeIngredient : recipe.ingredients;
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) raw = [raw];
  return raw
    .map(item => (item && typeof item === 'object' ? (item.text || item.name) : item))
    .map(cleanText)
    .filter(line => line && !isSectionHeader(line))
    .slice(0, MAX_INGREDIENTS);
};

// recipeInstructions comes as one string, a list of strings, a list of
// HowToStep objects, or HowToSection groups (sometimes nested) holding their
// steps in itemListElement. Each step becomes one paragraph, which is how
// splitMethod splits a method. A section's name ("For the sauce") goes on
// its own line at the top of the section's first step, so it shows above
// that step without being counted as a step itself.

const LINE_BREAK_TAG = /<br\s*\/?>|<\/(?:p|li|div|h[1-6])\s*>/gi;
const MAX_SECTION_DEPTH = 4;

// A plain string can hold the whole method: each line is a step.
const splitInstructionText = (text) =>
  String(text).replace(LINE_BREAK_TAG, '\n').split(/\r\n?|\n/).map(cleanText).filter(Boolean);

const isHowToSection = (node) => {
  const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
  return types.some(t => typeof t === 'string' && /(^|[/:])HowToSection$/.test(t.trim())) ||
    (node.itemListElement !== undefined && !cleanText(node.text));
};

const readSteps = (node, depth = 0) => {
  if (node === undefined || node === null || depth > MAX_SECTION_DEPTH) return [];
  if (Array.isArray(node)) return node.flatMap(child => readSteps(child, depth));
  if (typeof node === 'string' || typeof node === 'number') return splitInstructionText(node);
  if (typeof node !== 'object') return [];
  if (isHowToSection(node)) {
    const steps = readSteps(node.itemListElement, depth + 1);
    const name = cleanText(node.name);
    return name && steps.length ? [`${name}\n${steps[0]}`, ...steps.slice(1)] : steps;
  }
  const text = cleanText(node.text) || cleanText(node.name);
  return text ? [text] : [];
};

// Steps joined with blank lines, kept within the method cap. Whole steps are
// left off the end, so a cut falls between steps. Only a first step that is
// too long on its own is cut part way, at a space.
const joinMethod = (steps) => {
  let method = '';
  for (const step of steps) {
    const next = method ? `${method}\n\n${step}` : step;
    if (next.length > MAX_METHOD_LENGTH) {
      if (!method) {
        const slice = step.slice(0, MAX_METHOD_LENGTH);
        const space = slice.lastIndexOf(' ');
        method = (space > 0 ? slice.slice(0, space) : slice).trim();
      }
      return { method, cut: true };
    }
    method = next;
  }
  return { method, cut: false };
};

const siteNameFor = (url) => url.hostname.replace(/^www\./i, '');

const extractRecipeFromHtml = (html, pageUrl) => {
  const recipe = findRecipe(readJsonLdBlocks(String(html || '')));
  if (!recipe) return { ok: false, reason: 'not-a-recipe' };

  const ingredients = readIngredients(recipe);
  if (ingredients.length === 0) return { ok: false, reason: 'not-a-recipe' };

  let url;
  try { url = new URL(pageUrl); } catch (e) { url = null; }
  if (url) url.hash = '';

  // No method on the page means no `method` key at all. `methodCut` is only
  // there when the method was too long and its end was left off.
  const { method, cut } = joinMethod(readSteps(recipe.recipeInstructions));

  const nameSource = Array.isArray(recipe.name) ? recipe.name[0] : recipe.name;
  return {
    ok: true,
    recipe: {
      name: cleanText(nameSource).slice(0, MAX_NAME_LENGTH).trim(),
      servings: readServings(recipe.recipeYield),
      ingredients,
      ...(method ? { method } : {}),
      ...(method && cut ? { methodCut: true } : {}),
      sourceUrl: url ? url.toString() : String(pageUrl || ''),
      siteName: url ? siteNameFor(url) : ''
    }
  };
};

export { extractRecipeFromHtml, decodeEntities };
