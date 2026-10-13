import { extractRecipeFromHtml } from './extractRecipe';
import { splitMethod, MAX_METHOD_LENGTH } from './splitMethod';

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

describe('extractRecipeFromHtml: method', () => {
  const methodOf = (recipeInstructions) => extractRecipeFromHtml(page(recipe({ recipeInstructions })), URL_IN).recipe;

  test('a plain string with one step per line', () => {
    expect(methodOf('Heat the oven.\nBrown the beef.\r\nSimmer for two hours.').method)
      .toBe('Heat the oven.\n\nBrown the beef.\n\nSimmer for two hours.');
  });

  test('a plain string of HTML paragraphs and line breaks', () => {
    expect(methodOf('<p>Heat the oven.</p><p>Brown the beef.</p>Simmer.<br/>Serve.').method)
      .toBe('Heat the oven.\n\nBrown the beef.\n\nSimmer.\n\nServe.');
  });

  test('a single sentence is one step', () => {
    expect(methodOf('Put everything in a pan and cook it.').method).toBe('Put everything in a pan and cook it.');
  });

  test('a list of strings', () => {
    expect(methodOf(['Heat the oven.', 'Brown the beef.', 'Simmer.']).method)
      .toBe('Heat the oven.\n\nBrown the beef.\n\nSimmer.');
  });

  test('a list of HowToStep objects, using text', () => {
    expect(methodOf([
      { '@type': 'HowToStep', name: 'Heat', text: 'Heat the oven to 180C.' },
      { '@type': 'HowToStep', text: 'Brown the beef.', url: 'https://www.example.com/recipes/stew#step2' }
    ]).method).toBe('Heat the oven to 180C.\n\nBrown the beef.');
  });

  test('a HowToStep with no text falls back to its name', () => {
    expect(methodOf([
      { '@type': 'HowToStep', name: 'Heat the oven.' },
      { '@type': 'HowToStep', text: '', name: 'Brown the beef.' }
    ]).method).toBe('Heat the oven.\n\nBrown the beef.');
  });

  test('a single HowToStep that is not in a list', () => {
    expect(methodOf({ '@type': 'HowToStep', text: 'Cook it.' }).method).toBe('Cook it.');
  });

  test('a HowToSection name sits on its own line above the first step of the section', () => {
    const result = methodOf([
      {
        '@type': 'HowToSection',
        name: 'For the sauce',
        itemListElement: [
          { '@type': 'HowToStep', text: 'Melt the butter.' },
          { '@type': 'HowToStep', text: 'Whisk in the flour.' }
        ]
      },
      {
        '@type': 'HowToSection',
        name: 'To finish',
        itemListElement: [{ '@type': 'HowToStep', text: 'Pour over and bake.' }]
      }
    ]);
    expect(result.method).toBe('For the sauce\nMelt the butter.\n\nWhisk in the flour.\n\nTo finish\nPour over and bake.');
  });

  test('a section name shows as a heading line, not as a step of its own', () => {
    const result = methodOf([
      { '@type': 'HowToSection', name: 'For the sauce', itemListElement: [{ '@type': 'HowToStep', text: 'Melt the butter.' }, { '@type': 'HowToStep', text: 'Stir.' }] }
    ]);
    expect(splitMethod(result.method)).toEqual(['For the sauce\nMelt the butter.', 'Stir.']);
  });

  test('nested sections, a section with no name, and a section with no steps', () => {
    const result = methodOf([
      {
        '@type': 'HowToSection',
        name: 'Pastry',
        itemListElement: [
          { '@type': 'HowToSection', name: 'Make the dough', itemListElement: [{ '@type': 'HowToStep', text: 'Rub in the butter.' }] },
          { '@type': 'HowToStep', text: 'Chill.' }
        ]
      },
      { '@type': 'HowToSection', itemListElement: [{ '@type': 'HowToStep', text: 'Bake.' }] },
      { '@type': 'HowToSection', name: 'Empty', itemListElement: [] }
    ]);
    expect(result.method).toBe('Pastry\nMake the dough\nRub in the butter.\n\nChill.\n\nBake.');
  });

  test('section steps given as plain strings or as a single object', () => {
    const result = methodOf([
      { '@type': 'HowToSection', name: 'Sauce', itemListElement: ['Melt.', 'Whisk.'] },
      { '@type': 'HowToSection', name: 'Finish', itemListElement: { '@type': 'HowToStep', text: 'Bake.' } }
    ]);
    expect(result.method).toBe('Sauce\nMelt.\n\nWhisk.\n\nFinish\nBake.');
  });

  test('decodes entities and strips tags in steps and section names', () => {
    const result = methodOf([
      {
        '@type': 'HowToSection',
        name: 'Salt &amp; <b>pepper</b>',
        itemListElement: [
          { '@type': 'HowToStep', text: 'Heat to 180&deg;C &ndash; fan  160&#176;C.' },
          { '@type': 'HowToStep', text: 'Add <a href="/x">Nan&#39;s gravy</a>&nbsp;and &frac12; the stock.' },
          { '@type': 'HowToStep', text: 'Season &amp;#39;well&amp;#39;.' }
        ]
      }
    ]);
    expect(result.method).toBe("Salt & pepper\nHeat to 180°C – fan 160°C.\n\nAdd Nan's gravy and ½ the stock.\n\nSeason 'well'.");
  });

  test('a page with no method imports exactly as before, with no method key', () => {
    const result = extractRecipeFromHtml(page(recipe()), URL_IN);
    expect(result.recipe).not.toHaveProperty('method');
    expect(result.recipe).not.toHaveProperty('methodCut');
  });

  test.each([
    ['an empty string', ''],
    ['whitespace and empty tags', '  <p> </p> <br> '],
    ['an empty list', []],
    ['empty strings and steps', ['', '  ', { '@type': 'HowToStep', text: '' }, null]],
    ['null', null],
    ['a value of the wrong type', true],
    ['a step with nothing in it', { '@type': 'HowToStep' }]
  ])('%s gives no method key', (_label, recipeInstructions) => {
    const result = methodOf(recipeInstructions);
    expect(result).not.toHaveProperty('method');
    expect(result).not.toHaveProperty('methodCut');
  });

  test('a method over the cap stops at the last whole step that fits', () => {
    const step = `${'S'.repeat(998)}.`;
    const result = methodOf(Array.from({ length: 8 }, () => step));
    expect(result.method.length).toBeLessThanOrEqual(MAX_METHOD_LENGTH);
    expect(result.method.split('\n\n')).toEqual([step, step, step, step]);
    expect(result.methodCut).toBe(true);
  });

  test('a method exactly at the cap is not cut', () => {
    const result = methodOf(['A'.repeat(MAX_METHOD_LENGTH - 7), 'Bake.']);
    expect(result.method).toHaveLength(MAX_METHOD_LENGTH);
    expect(result).not.toHaveProperty('methodCut');
  });

  test('a single step over the cap is cut at a space', () => {
    const words = Array.from({ length: 1200 }, (_, i) => `word${i}`).join(' ');
    const result = methodOf([words, 'Serve.']);
    expect(result.method.length).toBeLessThanOrEqual(MAX_METHOD_LENGTH);
    expect(words.startsWith(result.method)).toBe(true);
    expect(words[result.method.length]).toBe(' ');
    expect(result.methodCut).toBe(true);
  });

  test('reads a WordPress recipe plugin style @graph with sections', () => {
    const graph = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', name: 'Easy lasagne' },
        recipe({
          name: 'Easy lasagne',
          recipeInstructions: [
            {
              '@type': 'HowToSection',
              name: 'For the ragù',
              itemListElement: [
                { '@type': 'HowToStep', text: 'Fry the onion &amp; garlic in the oil for 5 mins.', name: 'Fry the onion &amp; garlic in the oil for 5 mins.', url: 'https://www.example.com/recipes/stew#step-0-0' },
                { '@type': 'HowToStep', text: 'Add the mince and brown it.', name: 'Add the mince and brown it.' }
              ]
            },
            {
              '@type': 'HowToSection',
              name: 'To assemble',
              itemListElement: [
                { '@type': 'HowToStep', text: 'Layer up the ragù, pasta and white sauce.' },
                { '@type': 'HowToStep', text: 'Bake at 190&#8451; for 40 mins.' }
              ]
            }
          ]
        })
      ]
    };
    expect(extractRecipeFromHtml(page(graph), URL_IN).recipe.method).toBe(
      'For the ragù\nFry the onion & garlic in the oil for 5 mins.\n\nAdd the mince and brown it.\n\n' +
      'To assemble\nLayer up the ragù, pasta and white sauce.\n\nBake at 190℃ for 40 mins.'
    );
  });

  test('reads a news-site style list of HowToStep objects with HTML in the text', () => {
    const result = methodOf([
      { '@type': 'HowToStep', text: '<p>Heat oven to 200C/180C fan/gas 6. Put the potatoes in a roasting tin.</p>' },
      { '@type': 'HowToStep', text: '<p>Roast for 45 mins, turning halfway.</p>' }
    ]);
    expect(splitMethod(result.method)).toEqual([
      'Heat oven to 200C/180C fan/gas 6. Put the potatoes in a roasting tin.',
      'Roast for 45 mins, turning halfway.'
    ]);
  });
});
