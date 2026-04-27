# cat-fortune-v3

cat-fortune-v3 is copied from the stable V2 playable-lite baseline. It keeps the V1-style entry flow: players first choose one of five clear 心结, then solve a two-ingredient food riddle.

## CSV Runtime Flow

Editable content lives in `cat_fortune_csv_exports/`. The browser does not parse CSV files directly; run the compile step to generate the static runtime payload:

```sh
node scripts/compile-csv-to-runtime.js
```

This writes `content/runtime-data.json`, which is loaded by `app.js` at runtime. The runtime payload separates the current playable surface from future expansion data:

- `seed_issues`: the five V1 default 心结 choices from `cat_fortune_v1_seed_issues.csv`
- `issues`: the full 40-issue dataset from `cat_fortune_issue_master_full.csv`
- `shops`, `ingredients`, `recipes`, `half_success_hints`, `success_wisdom`, `nonsense_slips`
- metadata, validation results, and future-hook source tables for later V2 systems

The default start screen renders only `seed_issues`. The full 40-issue dataset stays available in `runtime-data.json`, but it is not exposed as the first playable choice list yet.

Core CSV sources:

- `cat_fortune_v1_seed_issues.csv`: V1 entry choices, seed riddles, V1 shop mapping, and fallback wisdom
- `cat_fortune_issue_master_full.csv`: Q01-Q40 canonical issue data
- `cat_fortune_recipes_and_half_success_hints.csv`: playable recipes and half-success hints
- `cat_fortune_success_wisdom.csv`: success result text
- `cat_fortune_ingredients.csv` and `cat_fortune_shops.csv`: playable shop inventory
- `cat_fortune_nonsense_slips.csv`: failure fallback slips

For local testing, serve the project as a static site so `fetch()` can load the JSON file:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Playable Lite Release

The current version is a playable-lite release, not the full 0424 PRD implementation yet. The default experience starts from the five V1 seed issues, while the full 40-issue dataset remains available in `content/runtime-data.json` for future expansion.

Release notes are in `docs/release-v2-playable-lite.md`.

## V3 Immersive Demo Direction

V3 starts as a direct copy of the stable V2 playable-lite project, not a rebuild from V1. The working V2 gameplay loop stays intact: rainy opening, `[ 推门而入 ]`, cat master intro, five seed issue choices, runtime-data-driven issue loading, two sacrifice slots, and success / half-success / failure result overlays.

V3 focuses on immersive demo polish around the existing loop. The priorities are:

- Asset system
- Mood-card-style seed selection
- Shop/ingredient scene polish
- Lightweight sacrifice judgement transition
- Result card polish
- Image/audio/sprite placeholders

The five seed issue choices are now presented as lightweight mood cards. This is the first step toward the 0424 PRD card-selection direction, while full multi-level card selection remains future work.

The issue play screen now has lightweight shop-interior polish: an issue brief, neon shop signboard, shopkeeper placeholder, ingredient rack, and sacrifice counter. Shopkeeper and scene image slots are placeholder-ready through asset hooks, while the full three-shop street scene and real image assets remain future work.

The shop-interior play screen has also been compacted for one-screen demo usability on desktop, with internal scrolling allowed for dense ingredient racks.

Stage 3 now adds lightweight shop-entry and shopkeeper interaction polish around the existing issue play screen. Selecting an issue briefly shows a shop-specific CSS entrance transition before play begins, and the placeholder shopkeeper cats now support default, hover/focus, click, and keyboard-triggered dialogue feedback without real NPC images or audio.

Stage 3 also includes a lightweight three-way failure punishment baseline. Fully wrong sacrifices now route through weighted failure outcomes: the existing nonsense slip, clickable mud paw marks, or clickable/auto-closing cat hair allergy. These are CSS/text-only demo interactions; real assets, precise swipe gestures, and full cinematic punishment animations remain future work.

Submitting a full sacrifice now enters a lightweight judgement transition before showing the result. Stage 1 now includes a judgement overlay, bell shake, glowing sacrifice slots, smoke/glow/flash polish, ingredient fusion cards, a cat silhouette placeholder, and safe SFX hooks for future audio assets, while full physics-style collision, real audio production, and final cat sprite judgement remain future work.

Stage 2 card-selection is completed for the current demo baseline. The default five seed issues remain the main entry, and a separate expanded three-level emotional card-flow demo can be opened from the seed screen using only those five seed issues. The expanded flow now includes lightweight oracle-mode cat master ambience, star-circle/card-dealing polish, and a selected-issue light-orb transition into the existing issue play screen. Full 40-issue taxonomy, real cat sprites, real audio, and full cinematic PRD card animation remain future work.

V3 does not yet implement:

- Full 40-issue public card system
- Full collection book
- Full cinematic mud-paw/cat-hair punishment interactions with real assets and precise gestures
- Real LLM API
- Backend database
- Major framework migration

## Validation

These scripts require Node.js and use only built-in Node modules.

```sh
node scripts/compile-csv-to-runtime.js
node scripts/validate-content.js
node scripts/build-content-report.js
node scripts/check-prd-markdown.js
node scripts/audit-content-review.js
node scripts/validate-assets.js
node -c app.js
```

The compile step prints the runtime report, including seed issue count, full issue count, shop and ingredient counts, and whether each seed has a valid full issue, recipe, success wisdom, and half-success hint.

`check-prd-markdown.js` checks the converted Markdown PRD source for appendix and Q01-Q40 coverage.
`audit-content-review.js` summarizes content fields that still need manual review, including inferred titles, generated riddle text, and inferred taxonomy.

## Current Scope

Implemented now:

- Lightweight opening cover with a dark rainy street mood, neon title, and `[ 推门而入 ]` entry button
- Short cat master intro using the 0424 dialogue lines before seed selection begins
- Start from five V1 seed 心结, without showing internal Q ids to the player
- Offer a separate expanded three-level emotional card-flow demo using the same five seed 心结
- Resolve the selected seed to its full issue by `issue_id`
- Use two lightweight sacrifice slots: ingredient clicks fill empty slots, filled slots can be clicked to remove, and judging happens only after clicking `选好了`
- Show lightweight PRD-aligned result overlays: success food wisdom card, half-success hint modal, and nonsense-slip failure modal
- Route full failures through lightweight weighted punishments: nonsense slip, mud paw marks, or cat hair allergy
- Show the available riddle, mapped shop, playable ingredients, success wisdom, half-success hints, failure slip, retry, and another-issue loop

Intentionally left as future V2 hooks:

- Full opening animation, door curtain transition, and real audio/BGM
- Card-selection animation
- Complete three-shop street scene
- Backpack opening, ingredient flying, smoke transition, and cat master silhouette judgement animations
- Full food card animation, rotating gold rays, collection book persistence, and card collection UI
- Real-asset mud-paw/cat-hair punishment cinematics and precise swipe gesture handling
