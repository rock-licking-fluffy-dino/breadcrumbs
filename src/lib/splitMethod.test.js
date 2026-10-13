import { splitMethod, MAX_METHOD_LENGTH } from './splitMethod';

describe('splitMethod', () => {
  test('one step per paragraph', () => {
    const text = 'Heat the oven.\n\nBrown the beef in batches.\n\nSimmer for two hours.';
    expect(splitMethod(text)).toEqual(['Heat the oven.', 'Brown the beef in batches.', 'Simmer for two hours.']);
  });

  test('several blank lines count as one break', () => {
    expect(splitMethod('First.\n\n\n\nSecond.\n  \nThird.')).toEqual(['First.', 'Second.', 'Third.']);
  });

  test('keeps single line breaks inside a paragraph', () => {
    expect(splitMethod('Mix the flour\nand the butter.\n\nBake.')).toEqual(['Mix the flour\nand the butter.', 'Bake.']);
  });

  test('numbered lines without blank lines start new steps', () => {
    const text = '1. Heat the oven.\n2. Brown the beef.\n3. Simmer.';
    expect(splitMethod(text)).toEqual(['Heat the oven.', 'Brown the beef.', 'Simmer.']);
  });

  test('"1)" style numbers', () => {
    expect(splitMethod('1) Chop.\n2) Fry.\n10) Serve.')).toEqual(['Chop.', 'Fry.', 'Serve.']);
  });

  test('a line without a number joins the step above it', () => {
    expect(splitMethod('1. Chop the onions\nfinely.\n2. Fry.')).toEqual(['Chop the onions\nfinely.', 'Fry.']);
  });

  test('strips numbers from numbered paragraphs', () => {
    expect(splitMethod('1. Chop.\n\n2. Fry.')).toEqual(['Chop.', 'Fry.']);
  });

  test('does not treat a quantity as a step number', () => {
    expect(splitMethod('1.5 kg flour goes in first.\n2. Stir.')).toEqual(['1.5 kg flour goes in first.', 'Stir.']);
  });

  test('a plain single paragraph is one step', () => {
    expect(splitMethod('Put everything in a pan and cook it.')).toEqual(['Put everything in a pan and cook it.']);
    expect(splitMethod('Put it in a pan.\nCook it.')).toEqual(['Put it in a pan.\nCook it.']);
  });

  test('empty, whitespace and missing text give no steps', () => {
    expect(splitMethod('')).toEqual([]);
    expect(splitMethod('   \n\n  \t ')).toEqual([]);
    expect(splitMethod(undefined)).toEqual([]);
    expect(splitMethod(null)).toEqual([]);
    expect(splitMethod(42)).toEqual([]);
  });

  test('Windows line endings', () => {
    expect(splitMethod('Heat.\r\n\r\nBrown.\r\n\r\nSimmer.')).toEqual(['Heat.', 'Brown.', 'Simmer.']);
    expect(splitMethod('1. Heat.\r\n2. Brown.\r\n3. Simmer.')).toEqual(['Heat.', 'Brown.', 'Simmer.']);
  });

  test('a number on its own is dropped, not shown as an empty step', () => {
    expect(splitMethod('1.\n\nChop.')).toEqual(['Chop.']);
  });

  test('the cap is 5,000 characters', () => {
    expect(MAX_METHOD_LENGTH).toBe(5000);
  });
});
