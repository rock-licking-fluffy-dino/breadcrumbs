import { extractRecipeFromHtml } from './extractRecipe';

const URL_IN = 'https://www.example.com/recipes/stew#comments';

const page = (...blocks) => `<!doctype html><html><head><title>Test</title>
${blocks.map(b => `<script type="application/ld+json">${typeof b === 'string' ? b : JSON.stringify(b)}</script>`).join('\n')}
</head><body><h1>Hello</h1></body></html>`;

const recipe = (extra = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'Recipe',
  name: 'Beef stew',
  recipeYield: '4',
  recipeIngredient: ['500g braising steak', '2 onions', '3 carrots'],
  ...extra
});

describe('extractRecipeFromHtml', () => {
  test('reads a plain Recipe object', () => {
    const result = extractRecipeFromHtml(page(recipe()), URL_IN);
    expect(result).toEqual({
      ok: true,
      recipe: {
        name: 'Beef stew',
        servings: 4,
        ingredients: ['500g braising steak', '2 onions', '3 carrots'],
        sourceUrl: 'https://www.example.com/recipes/stew',
        siteName: 'example.com'
      }
    });
  });

  test('finds a Recipe inside @graph', () => {
    const graph = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', name: 'Example' },
        { '@type': 'BreadcrumbList', itemListElement: [] },
        recipe({ name: 'Graph stew' })
      ]
    };
    const result = extractRecipeFromHtml(page(graph), URL_IN);
    expect(result.ok).toBe(true);
    expect(result.recipe.name).toBe('Graph stew');
  });

  test('finds a Recipe one level down, under mainEntity', () => {
    const wrapped = { '@type': 'WebPage', mainEntity: recipe({ name: 'Nested stew' }) };
    expect(extractRecipeFromHtml(page(wrapped), URL_IN).recipe.name).toBe('Nested stew');
  });

  test('finds a Recipe in a top-level array', () => {
    const list = [{ '@type': 'Organization', name: 'Example' }, recipe({ name: 'Array stew' })];
    expect(extractRecipeFromHtml(page(list), URL_IN).recipe.name).toBe('Array stew');
  });

  test('accepts @type given as an array containing Recipe', () => {
    const result = extractRecipeFromHtml(page(recipe({ '@type': ['Recipe', 'NewsArticle'] })), URL_IN);
    expect(result.ok).toBe(true);
    expect(result.recipe.ingredients).toHaveLength(3);
  });

  test('finds the script tag whatever its case and extra attributes', () => {
    const html = `<SCRIPT class="yoast-schema-graph" TYPE='application/ld+json' nonce="x">${JSON.stringify(recipe())}</SCRIPT>`;
    expect(extractRecipeFromHtml(html, URL_IN).ok).toBe(true);
  });

  test.each([
    ['Serves 4', 4],
    [['4', '4 servings'], 4],
    [6, 6],
    ['Makes 12 biscuits', 12],
    ['4-6', 4],
    ['Serves 200', 50],
    ['A crowd', null],
    [undefined, null]
  ])('reads recipeYield %p as %p', (recipeYield, servings) => {
    const result = extractRecipeFromHtml(page(recipe({ recipeYield })), URL_IN);
    expect(result.recipe.servings).toBe(servings);
  });

  test('decodes entities, strips tags and collapses whitespace', () => {
    const result = extractRecipeFromHtml(page(recipe({
      name: 'Mac &amp; cheese  <b>bake</b>',
      recipeIngredient: [
        'Salt &amp; pepper',
        'Nan&#39;s  gravy',
        '&frac12; tsp paprika',
        '&#189; lemon',
        '&#xBD; lime',
        '1 <a href="/x">onion</a>, sliced'
      ]
    })), URL_IN);
    expect(result.recipe.name).toBe('Mac & cheese bake');
    expect(result.recipe.ingredients).toEqual([
      'Salt & pepper',
      "Nan's gravy",
      '½ tsp paprika',
      '½ lemon',
      '½ lime',
      '1 onion, sliced'
    ]);
  });

  test('drops section headers and empty lines', () => {
    const result = extractRecipeFromHtml(page(recipe({
      recipeIngredient: ['For the sauce:', '2 tbsp soy sauce', '', '   ', 'FOR THE TOPPING', '100g cheddar']
    })), URL_IN);
    expect(result.recipe.ingredients).toEqual(['2 tbsp soy sauce', '100g cheddar']);
  });

  test('falls back to the older ingredients property', () => {
    const old = recipe({ recipeIngredient: undefined, ingredients: ['1 egg'] });
    expect(extractRecipeFromHtml(page(old), URL_IN).recipe.ingredients).toEqual(['1 egg']);
  });

  test('caps the name at 100 characters and the list at 60 lines', () => {
    const result = extractRecipeFromHtml(page(recipe({
      name: 'A'.repeat(150),
      recipeIngredient: Array.from({ length: 80 }, (_, i) => `${i + 1} eggs`)
    })), URL_IN);
    expect(result.recipe.name).toHaveLength(100);
    expect(result.recipe.ingredients).toHaveLength(60);
  });

  test('returns not-a-recipe for JSON-LD with no Recipe', () => {
    const article = { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: 'News' };
    expect(extractRecipeFromHtml(page(article), URL_IN)).toEqual({ ok: false, reason: 'not-a-recipe' });
  });

  test('returns not-a-recipe for a page with no JSON-LD at all', () => {
    expect(extractRecipeFromHtml('<html><body>Hi</body></html>', URL_IN)).toEqual({ ok: false, reason: 'not-a-recipe' });
  });

  test('returns not-a-recipe for a Recipe with no ingredients', () => {
    const empty = recipe({ recipeIngredient: [] });
    expect(extractRecipeFromHtml(page(empty), URL_IN)).toEqual({ ok: false, reason: 'not-a-recipe' });
  });

  test('skips a broken JSON-LD block sitting next to a valid one', () => {
    const result = extractRecipeFromHtml(page('{ "@type": "Recipe", "name": ', recipe({ name: 'Good stew' })), URL_IN);
    expect(result.ok).toBe(true);
    expect(result.recipe.name).toBe('Good stew');
  });
});
