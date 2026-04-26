# AGENTS.md

## Project

Project name: 大馋猫：深夜占卜  
English concept name: AI-assisted Emotional Food Divination Game  
Current working baseline: cat-fortune-v2 playable-lite  
Next target: cat-fortune-v3 immersive demo version

This project is a lightweight emotional divination web game.  
Players choose a current emotional knot, read a food riddle from the cat master, select two ingredients from a Hong Kong-style late-night shop, place them into sacrifice slots, and receive a food result with cat-style wisdom.

The game is not a cooking management game or a traditional psychological test.  
It is a short, stylized emotional interaction built around food metaphors, cats, late-night atmosphere, and light puzzle-solving.

---

## Current Technical Stack

- Static HTML / CSS / JavaScript
- No frontend framework
- No backend
- CSV files as editable content source
- Node.js script compiles CSV into `content/runtime-data.json`
- Frontend loads `content/runtime-data.json`
- Local testing via `python3 -m http.server`
- Intended deployment via GitHub Pages / Cloudflare Pages / Vercel

---

## Current Stable V2 Features

The current V2 playable-lite version already supports:

- Lightweight rainy opening cover
- `[ 推门而入 ]` entry button
- Cat master intro dialogue
- Five V1 seed issue choices as default entry
- Runtime-data-driven issue loading
- Riddle / shop / ingredient selection
- Two sacrifice slots
- Submit button: `选好了`
- Incomplete-slot warning: `食材还不充足哦`
- Success result overlay with food name and wisdom
- Half-success modal with hint
- Failure modal with random nonsense slip
- Retry after half-success / failure
- Return to issue selection after success

Important: the full 40-issue dataset exists in runtime data, but the default first screen must only show the five V1 seed issues.

---

## Important Product Rule

Do not directly expose all 40 issues on the first screen.

The V1 five-seed-entry structure is a validated gameplay baseline:

1. Deadline 任务过载
2. 此时此刻的嫉妒心
3. 对性格短板的怀疑
4. 报复性熬夜
5. 倒霉透顶求转机

The 40-issue dataset is future expansion content, not the default entry UI.

---

## Development Workflow

When modifying content or behavior:

1. Update CSV files if content changes.
2. Run:

```sh
node scripts/compile-csv-to-runtime.js
```

3. Test locally:

```sh
python3 -m http.server 4173
```

4. Open:

```text
http://localhost:4173
```

5. Validate:

```sh
node scripts/validate-content.js
node scripts/build-content-report.js
node scripts/check-prd-markdown.js
node scripts/audit-content-review.js
node -c app.js
```

6. Commit only after local behavior is verified.

---

## Codex Behavior Rules

When working on this project:

1. Conclusion first.
2. Do not be verbose.
3. Do not implement unrelated features.
4. Do not rewrite the whole app unless explicitly asked.
5. Do not break the current V2 playable loop.
6. Do not change the default entry from five seed issues to all 40 issues.
7. Do not invent missing product content unless explicitly asked.
8. If source information is missing or ambiguous, report it and ask for confirmation.
9. Prefer small, reviewable iterations.
10. Each task should include:
    - modified files
    - validation commands run
    - what was implemented
    - what remains future work

---

## Preferred Task Size

Good task examples:

- Add asset folders and asset manifest.
- Make seed issue choices look like mood cards.
- Add lightweight bell/smoke judgement transition.
- Add placeholder image slots for shop scenes.
- Add audio hooks without real audio assets.
- Improve result card visuals.

Bad task examples:

- Implement the full PRD.
- Add all animations, audio, collection, NPC, and card system at once.
- Replace the current architecture with a framework.
- Expose all 40 issues as the default UI.

---

## V3 Direction

V3 should be copied from the stable V2 baseline.

V3 should focus on:

- Asset system
- Image placeholder slots
- Audio placeholder hooks
- Mood-card interaction polish
- Shop interior polish
- Sacrifice and judgement animation polish
- Result card polish
- Demo-readiness

V3 should not try to fully implement every 0424 PRD feature at once.
