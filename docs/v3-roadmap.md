# V3 Roadmap

## V3 Goal

V3 turns the stable V2 playable-lite release into an immersive demo while preserving the current working gameplay loop and CSV-to-runtime content pipeline.

The baseline flow remains:

```text
rainy opening
-> cat master intro
-> five seed issue choices
-> riddle/shop/ingredients
-> sacrifice two ingredients
-> success / half-success / failure result
```

## V3 Principles

- Copy from stable V2; do not rebuild from V1.
- Keep the five V1 seed issues as the default playable entry.
- Keep the full 40-issue dataset as future expansion data, not the first screen.
- Preserve runtime JSON loading and all CSV validation scripts.
- Add polish in small, reviewable layers.
- Prefer placeholders and documented asset hooks before adding heavy animation.
- Avoid framework migration, backend work, or real LLM integration during V3 baseline work.

## Planned Iteration Steps

1. Asset system scaffold
   - Create image, audio, and sprite folders.
   - Add `content/asset-manifest.json`.
   - Add `scripts/validate-assets.js`.
   - Document placeholder and naming rules.

2. Mood-card seed selection
   - Restyle the five seed choices as mood cards.
   - Keep existing issue IDs and runtime-data lookup behavior.
   - Avoid exposing all 40 issues by default.

3. Shop/interior visual polish
   - Add placeholder slots for shop backgrounds and shopkeeper sprites.
   - Improve ingredient presentation without changing recipe judgement.
   - Keep shop inventory driven by runtime data.

4. Sacrifice/judgement transition
   - Add a lightweight transition after `选好了`.
   - Keep two-slot logic and success / half-success / failure rules unchanged.
   - Add optional audio hooks that gracefully no-op when assets are missing.

5. Result card polish
   - Improve success, half-success, and failure result presentation.
   - Add placeholder result-food card imagery.
   - Keep retry and return-to-issue-selection behavior.

6. Deployment/demo polish
   - Verify static hosting behavior.
   - Run all validation scripts.
   - Check first-load behavior with missing optional assets.
   - Prepare demo notes and remaining manual review items.

## V3 Non-goals

- Do not implement the full 40-issue public card system.
- Do not implement a full collection book.
- Do not implement mud-paw or cat-hair punishment interactions.
- Do not connect a real LLM API.
- Do not add a backend database.
- Do not migrate to React, Vue, or another major framework.
- Do not rewrite the current app structure.
- Do not change CSV content unless a validation issue requires it.

## Manual QA Checklist

- Opening cover appears with rainy mood and `[ 推门而入 ]`.
- Entry button advances to cat master intro.
- Cat master intro advances to the five seed issue choices.
- Only the five V1 seed issues are shown on the default entry screen.
- Selecting each seed loads a riddle, shop context, and ingredients.
- Ingredient clicks fill two sacrifice slots.
- Clicking a filled slot removes that ingredient.
- Submitting with incomplete slots shows `食材还不充足哦`.
- Correct pair shows the success result overlay.
- One correct ingredient shows the half-success hint modal.
- Wrong pair shows a random nonsense-slip failure modal.
- Retry returns to ingredient selection after half-success or failure.
- Success can return to issue selection.
- `node scripts/compile-csv-to-runtime.js` passes.
- `node scripts/validate-content.js` passes.
- `node scripts/build-content-report.js` passes.
- `node scripts/check-prd-markdown.js` passes.
- `node scripts/audit-content-review.js` passes.
- `node scripts/validate-assets.js` passes.
- `node -c app.js` passes.

