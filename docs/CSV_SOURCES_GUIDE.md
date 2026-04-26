# CSV_SOURCES_GUIDE

This project uses CSV files as editable content sources.

The browser does not read CSV directly.  
Instead, run:

```sh
node scripts/compile-csv-to-runtime.js
```

This generates:

```text
content/runtime-data.json
```

The frontend reads `runtime-data.json`.

---

## Main CSV Folder

```text
cat_fortune_csv_exports/
```

---

## Core Runtime CSVs

### `cat_fortune_v1_seed_issues.csv`

Purpose:

Defines the five default V1-style emotional entry choices.

Used for:

- First playable issue selection screen
- Current default game entry
- Mapping seed issues to full issue IDs
- Preserving V1 validated gameplay baseline

Important:

This file controls the default first screen.  
Do not replace it with all 40 issues unless explicitly redesigning the entry flow.

---

### `cat_fortune_issue_master_full.csv`

Purpose:

Full 40-issue master table.

Used for:

- Future expansion
- Looking up full issue records by `issue_id`
- Preserving Q01–Q40 dataset

Current role:

The full dataset is available in runtime data but not exposed as the default entry UI.

---

### `cat_fortune_recipes_and_half_success_hints.csv`

Purpose:

Defines each issue’s recipe and half-success hints.

Used for:

- Correct ingredient pair judgement
- Half-success detection
- Hint text when exactly one ingredient matches

Important:

This file is central to gameplay judgement.

---

### `cat_fortune_success_wisdom.csv`

Purpose:

Defines success result food and wisdom text.

Used for:

- Success result card
- Cat wisdom display
- Final emotional closure

---

### `cat_fortune_ingredients.csv`

Purpose:

Defines ingredient records.

Used for:

- Ingredient grid
- Shop inventory
- Ingredient labels
- Ingredient descriptions or future hover text

---

### `cat_fortune_shops.csv`

Purpose:

Defines shop records.

Used for:

- Shop name
- Shop description
- Shop identity and display text
- Mapping ingredients and issues to shop context

---

### `cat_fortune_nonsense_slips.csv`

Purpose:

Defines failure nonsense-slip texts.

Used for:

- Current active failure result
- Random failure modal

---

## Secondary / Future-hook CSVs

### `cat_fortune_failure_penalties.csv`

Purpose:

Defines failure penalty types.

Used for:

- Nonsense slip
- Mud-paw future hook
- Cat-hair future hook
- Penalty weights and implementation status

Current version:

Only nonsense slip is active.  
Mud-paw and cat-hair remain future hooks.

---

### `cat_fortune_ui_copy.csv`

Purpose:

Reusable UI copy.

Used for:

- Buttons
- Helper messages
- Dialogue text
- Future copy centralization

---

### `cat_fortune_flow_states.csv`

Purpose:

Reference flow-state table.

Used for:

- State machine planning
- Future interaction expansion
- PRD-to-implementation mapping

Not necessarily read directly by frontend in every version.

---

### `cat_fortune_game_rules.csv`

Purpose:

Defines gameplay rules and edge cases.

Used for:

- Judgement rule documentation
- Slot behavior
- Failure behavior
- Future validation and implementation reference

---

### `cat_fortune_shop_scene_specs.csv`

Purpose:

Defines shop scene design requirements.

Used for:

- Future shop interior polish
- Shop-specific visual identity
- NPC / decor / ambience reference

Current version:

Mostly reference data for V3.

---

### `cat_fortune_asset_placeholders.csv`

Purpose:

Defines placeholder asset needs.

Used for:

- Future asset manifest creation
- Image/audio/sprite planning
- V3 material preparation

---

### `cat_fortune_issue_taxonomy_review.csv`

Purpose:

Tracks issue categorization review.

Used for:

- Future full 40-issue card system
- Manual taxonomy review
- Avoiding AI-inferred taxonomy being treated as final

---

### `cat_fortune_csv_manifest.csv`

Purpose:

Documents CSV file inventory.

Used for:

- Human review
- Pipeline documentation
- Codex orientation

---

## Runtime Compile Rule

When CSV changes, always run:

```sh
node scripts/compile-csv-to-runtime.js
```

Then check:

```text
content/runtime-data.json
```

Expected key runtime counts:

- seed issues: 5
- full issues: 40
- shops: 3
- ingredients: 18
- recipes: 40
- half-success hints: 40
- success wisdom entries: 40

---

## Important Product Rule

CSV data contains both current playable content and future expansion content.

Current playable surface:

- `seed_issues`
- mapped issue
- recipe
- ingredients
- success wisdom
- half-success hint
- nonsense slip

Future expansion:

- full 40-issue card system
- taxonomy
- complete shop scene system
- collection
- additional punishments
- asset-driven polish
