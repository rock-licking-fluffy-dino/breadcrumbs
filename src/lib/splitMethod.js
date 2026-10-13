// ── Recipe method ─────────────────────────────────────────────────────────
// A recipe's method is stored as one string and split into steps when it is
// shown. One step per paragraph (a blank line between). If the text has no
// blank lines, a line starting with a number ("1.", "2)") starts a new step.
// Leading numbers are stripped: the app adds its own.
//
// Pure: no dependencies. Shared by the recipe sheet and its tests.

const MAX_METHOD_LENGTH = 5000;

// "1." or "2)" at the start of a line. Not "1.5 kg", which is a quantity.
const STEP_NUMBER = /^\s*\d{1,3}\s*[.)](?!\d)\s*/;

const tidyStep = (step) => step
  .replace(STEP_NUMBER, '')
  .split('\n')
  .map(line => line.trim())
  .join('\n')
  .trim();

const splitMethod = (text) => {
  if (typeof text !== 'string') return [];
  const normalised = text.replace(/\r\n?/g, '\n').trim();
  if (!normalised) return [];

  let steps;
  if (/\n[ \t]*\n/.test(normalised)) {
    steps = normalised.split(/\n[ \t]*\n\s*/);
  } else {
    steps = [];
    normalised.split('\n').forEach(line => {
      if (steps.length === 0 || STEP_NUMBER.test(line)) steps.push(line);
      else steps[steps.length - 1] += `\n${line}`;
    });
  }
  return steps.map(tidyStep).filter(Boolean);
};

export { splitMethod, MAX_METHOD_LENGTH };
