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
- Keep the full 40-issue dataset out of the first screen; expose it only through the separate expanded card-flow entry.
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

2. Mood-card seed selection / Stage 2 card-flow scaffold
   - Status: completed for the current demo baseline.
   - Restyle the five seed choices as mood cards.
   - Keep existing issue IDs and runtime-data lookup behavior.
   - Avoid exposing all 40 issues by default.
   - Added a lightweight multi-level card-flow state scaffold for category -> subcategory -> issue -> existing issue play.
   - The expanded card-flow entry is separate from the default five-seed path and uses the five seed issues only.
   - Added lightweight oracle-mode cat master ambience, star-circle/card-dealing polish, and selected-issue light-orb transition.
   - Full 40-issue taxonomy, real cat sprites, real audio, and full PRD cinematic card transition remain future work.

3. Shop/interior visual polish
   - Status: completed for the current demo baseline.
   - Added lightweight issue brief, shop signboard, shopkeeper placeholder, ingredient rack, and sacrifice counter styling.
   - Added shop-specific CSS entry transition before the existing issue play screen.
   - Added lightweight shopkeeper NPC feedback: default lines, hover/focus hints, click cycling, and keyboard interaction.
   - Added lightweight weighted three-way failure punishments: nonsense slip, mud paw marks, and cat hair allergy.
   - Placeholder hooks exist for shop backgrounds and shopkeeper sprites.
   - Ingredient presentation is improved without changing recipe judgement.
   - Shop inventory remains driven by runtime data.
   - Real shop assets, real NPC images/audio, precise swipe gestures, and full cinematic punishment animations remain future work.

4. Sacrifice/judgement transition
   - Status: completed for the current demo baseline.
   - Added a lightweight transition after `选好了`.
   - Added bell shake, sacrifice slot glow, and CSS smoke/glow overlay polish.
   - Added text-only ingredient fusion cards and a cat silhouette judgement placeholder.
   - Added safe SFX hooks for future optional audio assets.
   - Keep two-slot logic and success / half-success / failure rules unchanged.
   - Real audio files, final cat sprites, physics-style animation, and full PRD-level cinematic judgement remain future work.

5. Result card polish
   - Status: completed for the current Stage 4 demo baseline.
   - Improve success, half-success, and failure result presentation.
   - Add placeholder result-food card imagery.
   - Keep retry and return-to-issue-selection behavior.
   - The current failure baseline includes lightweight playable penalties, while full PRD cinematic punishments remain future work.

## Stage 4 Demo Baseline

Stage 4 is completed for the current non-publishing demo baseline:

- 4.1 manual 40-issue card-flow review: completed.
- 4.2 runtime CSV connection: completed; `card_flow` is compiled from the reviewed CSV into `content/runtime-data.json`.
- 4.3 localStorage collection book: completed; success food wisdom cards are saved locally and survive refresh on the same device.
- 4.4 fly-to-book animation: completed; success collection gives short visual feedback and updates the top-right `账本` count.

Future PRD-level work remains separate:

- Full collection book art and polished food-card visuals.
- Full 40-card locked/unlocked album states.
- Duplicate collection variants and richer repeated-collection feedback.
- Account/cloud storage and backend sync.
- Final image, sprite, and audio asset integration.

6. Deployment/demo polish
   - Verify static hosting behavior.
   - Run all validation scripts.
   - Check first-load behavior with missing optional assets.
   - Prepare demo notes and remaining manual review items.

## V3 Non-goals

- Do not replace the default five-seed entry with the 40-issue flow.
- Do not treat the lightweight localStorage book as the final full album system.
- Do not implement full cinematic mud-paw or cat-hair punishment interactions with real assets or precise gestures.
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
- Wrong pair routes through weighted lightweight failure punishment: nonsense slip, mud paw marks, or cat hair allergy.
- Mud paw marks can be clicked away and then return to the same issue.
- Cat hair strands can be clicked away or auto-close after the demo timer, then return to the same issue.
- Retry returns to ingredient selection after half-success or failure.
- Success can return to issue selection.
- Expanded `探索更多心结` shows reviewed Level 1 -> Level 2 -> issue cards without visible Q ids.
- Success `把智慧带走` saves a food wisdom card into the localStorage `账本`.
- Refreshing the page preserves collected entries on the same browser/device.
- Opening and closing the collection book overlay works.
- Collecting the same success again avoids duplicate cards and can show repeated-collection feedback.
- `node scripts/compile-csv-to-runtime.js` passes.
- `node scripts/validate-content.js` passes.
- `node scripts/build-content-report.js` passes.
- `node scripts/check-prd-markdown.js` passes.
- `node scripts/audit-content-review.js` passes.
- `node scripts/validate-assets.js` passes.
- `node -c app.js` passes.
