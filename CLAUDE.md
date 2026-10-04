# Breadcrumbs

Real-time collaborative shopping list with recipes, store layouts and category management. Lists are shared by a 6-character code.

## How to work on this repo

- Never commit to `main`.
- Main goes straight to users.
- One small task per branch. If a task grows, stop and ask.
- Open a pull request for every change. The owner reviews and merges.
- Make targeted edits. Never rewrite or re-save the whole of `src/App.js`.
- Do not reformat, re-indent or tidy code outside the task.
- If a change would remove more than 300 lines, stop and ask first.
- State the lines added and removed in every pull request description.
- Run `CI=true npm test` before opening a pull request. Say what you tested and what you could not.
- Do not touch `firestore.rules` or `public/service-worker.js` unless the task names them.
- Do not add dependencies. Use npm, and keep `.npmrc` as it is.

## Architecture

- React 18 PWA built with Create React App and Tailwind. Almost all UI lives in `src/App.js` (about 6,800 lines), styled with the `THEMES` object rather than Tailwind classes.
- Firebase/Firestore for data. `lists/{listId}` holds `items`, `recipes`, `hideCompleted` and `updatedAt`. `meta/categories` holds categories and store layouts. `trips/{tripId}` is create-only.
- `firestore.rules` only allows listed fields (`hasOnly`). Adding a field to a list document will be rejected until the rules change, so stop and ask. Limits: 500 items, 100 recipes.
- `api/import-recipe.js` is a Vercel function. Keep it a POST, because the service worker serves every same-origin GET cache-first. Do not loosen its private-address blocking.
- `src/lib/extractRecipe.js` and the two test files cover recipe import and ingredient parsing.

## Design rules

- Direction C "Index": warm paper, ink rules, one serif for titles.
- Take every colour from `THEMES` (light and dark). Do not hard-code new ones.
- Yellow has four jobs only: the + button, crumbs still to get, a ticked checkbox and the primary button. Anything sitting on yellow uses literal `#1c1917`.
- Chalk (`#f7f5ef`) is the background.
- Instrument Serif has one weight. Always 400, never bold. Sans is Archivo.
- Glass is for the nav only.
- Check icons at 44px before committing to a design.
- Floating glass pill nav with words only (List, Recipes, Settings), and a separate + button.

## Writing rules

- UK English spelling (colour, practise, etc.)
- Short, direct sentences in the owner's voice.
- No em dashes.

## Decisions to flag, not guess

If a task forces a choice between two reasonable designs, stop and ask. Do not pick one silently.

## Task workflow

- Work from a GitHub issue where one exists. Name the branch `claude/<short-task-name>`.
- Put `Closes #<number>` in the pull request description so the issue closes when it is merged.
- Fill in the pull request checklist honestly. Leave a box unticked if it was not done.
- Do not start a second task on the same branch. Suggest a new issue instead.
