# cat-fortune-v2-playable-lite

Release type: internal playable-lite release

## Main Implemented Features

- CSV-driven runtime data
- Lightweight rainy opening
- Cat master intro
- Five V1 seed issue entry flow
- Sacrifice slots
- Success food wisdom card
- Half-success hint modal
- Nonsense-slip failure modal

## Intentionally Not Implemented Yet

- Full opening animation
- Audio / BGM
- Full card-selection system
- Full three-shop street scene
- NPC interaction
- Smoke / silhouette judgement animation
- Mud-paw and cat-hair punishments
- Collection book persistence

## Local Run Instructions

```sh
node scripts/compile-csv-to-runtime.js
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Validation Commands

```sh
node scripts/compile-csv-to-runtime.js
node scripts/validate-content.js
node scripts/build-content-report.js
node scripts/check-prd-markdown.js
node scripts/audit-content-review.js
node -c app.js
```
