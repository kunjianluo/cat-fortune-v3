# V3 Asset Spec

## Folder Structure

```text
assets/
  images/
    opening/
    cat-master/
    shops/
    ingredients/
    results/
    ui/
    placeholders/
  audio/
    bgm/
    sfx/
  sprites/
    cat-master/
    shopkeepers/
content/
  asset-manifest.json
```

## Image Categories

- `opening`: rainy street, doorway, curtain, title background, entrance mood images.
- `cat-master`: idle, intro, judging, success, failure, and dialogue stills.
- `shops`: exterior/interior backgrounds for the three playable shop moods.
- `ingredients`: ingredient icons and rack visuals.
- `results`: food result cards and result overlay images.
- `ui`: buttons, frames, card backs, dividers, bells, smoke, and small interface ornaments.
- `placeholders`: neutral fallback images used during development.

## Audio Categories

- `audio/bgm`: looping ambience or background music, such as rain and warm shop ambience.
- `audio/sfx`: short interaction sounds, such as click, door bell, sacrifice bell, success chime, and failure slip tear.

Recommended formats:

- BGM: `.mp3` or `.ogg`, stereo, normalized volume, short seamless loops where possible.
- SFX: `.wav`, `.mp3`, or `.ogg`, trimmed silence, normalized volume.

## Sprite Categories

- `sprites/cat-master`: cat master state sprites, frame strips, or transparent PNG sequences.
- `sprites/shopkeepers`: shopkeeper NPC sprites and state variants.

Recommended formats:

- Static sprites: transparent `.png` or `.webp`.
- Frame animation: numbered `.png` sequence or a documented sprite sheet.
- Avoid very large uncompressed source files in the web runtime.

## Recommended Dimensions

- Opening background: `1920x1080` or `2560x1440`.
- Cat master stills: `1024x1024` square transparent or softly framed images.
- Shop backgrounds: `1920x1080`.
- Ingredient icons: `256x256` transparent PNG/WebP.
- Result food cards: `1200x1600` portrait or `1024x1365`.
- UI ornaments: `128x128`, `256x256`, or scalable SVG when appropriate.
- Cat master sprite frames: `512x512` or `1024x1024`.
- Shopkeeper sprite frames: `768x1024` portrait transparent PNG/WebP.

## Naming Conventions

Use lowercase kebab-case names:

```text
opening-rainy-street-bg.webp
cat-master-idle.png
cat-master-intro.png
cat-master-judging.png
shop-bg-noodle-night.webp
shopkeeper-noodle-idle.png
ingredient-icons-placeholder.png
result-food-card-placeholder.webp
rain-ambience-loop.mp3
door-bell.wav
sacrifice-bell.wav
```

For animation sequences, append a zero-padded frame number:

```text
cat-master-judging-0001.png
cat-master-judging-0002.png
cat-master-judging-0003.png
```

## Placeholder Strategy

- Every planned asset should be listed in `content/asset-manifest.json`.
- Missing placeholder assets must not block the current playable loop.
- When an asset is absent, the UI should fall back to existing CSS, emoji, or text-based placeholders.
- Asset hooks should be added before final media is available.
- Mark final approved assets as `ready` in the manifest only after the file exists in the listed path.

## Copyright / Royalty-free Reminder

Only commit assets that are original, generated with rights to use in this project, public domain, or clearly royalty-free for web demo usage. Keep source notes or license links near final production assets when possible.

