import { parseIngredientLine, findCategoryForItem, scaleIngredientQuantity, scaleIngredientNote } from './App';

// App.js sets up Firebase when it loads. None of these tests touch it.
jest.mock('firebase/app', () => ({ initializeApp: () => ({}) }));
jest.mock('firebase/firestore', () => ({ getFirestore: () => ({}) }));
jest.mock('firebase/app-check', () => ({ initializeAppCheck: () => {}, ReCaptchaV3Provider: function ReCaptchaV3Provider() {} }));

// [input, name, quantity, note, aisle]
const TABLE = [
  ['Onion', 'Onion', 1, '', 'fruit-veg'],
  ['2 onions', 'Onions', 2, '', 'fruit-veg'],
  ['2-3 carrots', 'Carrots', 3, '', 'fruit-veg'],
  ['1 onion, finely chopped', 'Onion', 1, 'finely chopped', 'fruit-veg'],
  ['2 tbsp olive oil', 'Olive oil', 1, '2 tbsp', 'sauces-condiments'],
  ['½ tsp ground cumin', 'Ground cumin', 1, '½ tsp', 'spices-seasonings'],
  ['1½ cups plain flour', 'Plain flour', 1, '1½ cups', 'other'],
  ['400g chicken thighs, skin removed', 'Chicken thighs', 1, '400g, skin removed', 'meat-poultry'],
  ['3 garlic cloves, crushed', 'Garlic', 1, '3 cloves, crushed', 'fruit-veg'],
  ['400g tin chopped tomatoes', 'Chopped tomatoes', 1, '400g tin', 'canned-goods'],
  ['2 x 400g tins chopped tomatoes', 'Chopped tomatoes', 2, '400g tins', 'canned-goods'],
  ['100g (3½oz) butter, softened', 'Butter', 1, '100g (3½oz), softened', 'dairy-eggs'],
  ['2 large eggs', 'Eggs', 2, 'large', 'dairy-eggs'],
  ['1 lime, juiced', 'Lime', 1, 'juiced', 'fruit-veg'],
  ['Juice of 1 lemon', 'Lemon', 1, 'juice of', 'fruit-veg'],
  // "pepper" is listed under both Fruit & Veg and Spices; Fruit & Veg comes
  // first in the dictionary, as it did before whole-word matching.
  ['Salt and pepper, to taste', 'Salt and pepper', 1, 'to taste', 'fruit-veg'],
  ['6 rashers smoked streaky bacon', 'Smoked streaky bacon', 1, '6 rashers', 'meat-poultry'],
  ['300ml chicken stock', 'Chicken stock', 1, '300ml', 'sauces-condiments'],
];

describe('parseIngredientLine', () => {
  test.each(TABLE)('%s', (input, name, quantity, note) => {
    expect(parseIngredientLine(input)).toEqual({ name, quantity, note });
  });

  test('never returns an empty name', () => {
    expect(parseIngredientLine('400g')).toEqual({ name: '400g', quantity: 1, note: '' });
    expect(parseIngredientLine('4 cloves')).toEqual({ name: 'Cloves', quantity: 1, note: '4' });
  });

  test('caps a plain count at 20', () => {
    expect(parseIngredientLine('40 eggs').quantity).toBe(20);
  });
});

describe('findCategoryForItem', () => {
  test.each(TABLE)('%s', (input, name, quantity, note, aisle) => {
    expect(findCategoryForItem(parseIngredientLine(input).name)?.categoryId).toBe(aisle);
  });

  test('matches whole words only', () => {
    expect(findCategoryForItem('aubergine').categoryId).toBe('fruit-veg');
    expect(findCategoryForItem('Aubergines').categoryId).toBe('fruit-veg');
    expect(findCategoryForItem('tomato purée').categoryId).toBe('canned-goods');
    expect(findCategoryForItem('Tomato puree').categoryId).toBe('canned-goods');
    expect(findCategoryForItem('lime juice').categoryId).toBe('fruit-veg');
    expect(findCategoryForItem('gin').categoryId).toBe('alcohol');
  });
});

describe('scaling', () => {
  const up = 6 / 4;
  const down = 2 / 4;
  test('×N rounds up and never drops below 1', () => {
    expect(scaleIngredientQuantity(1, up)).toBe(2);
    expect(scaleIngredientQuantity(2, up)).toBe(3);
    expect(scaleIngredientQuantity(1, down)).toBe(1);
    expect(scaleIngredientQuantity(2, down)).toBe(1);
    expect(scaleIngredientQuantity(3, 7 / 3)).toBe(7);
  });

  test('notes scale their first amount only', () => {
    expect(scaleIngredientNote('400g, skin removed', up)).toBe('600g, skin removed');
    expect(scaleIngredientNote('400g, skin removed', down)).toBe('200g, skin removed');
    expect(scaleIngredientNote('½ tsp', up)).toBe('¾ tsp');
    expect(scaleIngredientNote('½ tsp', down)).toBe('¼ tsp');
    expect(scaleIngredientNote('1 tsp', up)).toBe('1½ tsp');
    expect(scaleIngredientNote('2-3 tbsp', up)).toBe('3-4½ tbsp');
    expect(scaleIngredientNote('100g (3½oz), softened', up)).toBe('150g (3½oz), softened');
    expect(scaleIngredientNote('large', up)).toBe('large');
    expect(scaleIngredientNote('finely chopped', up)).toBe('finely chopped');
    expect(scaleIngredientNote('400g tins', up)).toBe('400g tins');
    expect(scaleIngredientNote('400g tin', up)).toBe('400g tin');
    expect(scaleIngredientNote('1.5 kg', 1)).toBe('1.5 kg');
  });
});
