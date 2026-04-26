#!/bin/sh

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
ISSUES=""

REQUIRED_DIRS="
.
docs
content
schemas
scripts
assets
assets/audio
assets/images
assets/sprites
"

REQUIRED_FILES="
index.html
styles.css
app.js
README.md
docs/prd-v2-summary.md
docs/flow-opening.md
docs/flow-tag-selection.md
docs/flow-shop-and-sacrifice.md
docs/flow-results.md
docs/state-machine.md
docs/decision-log.md
docs/scope.md
"

for DIR in $REQUIRED_DIRS; do
  if [ ! -d "$ROOT/$DIR" ]; then
    ISSUES="${ISSUES}
- Missing directory: $DIR"
  fi
done

for FILE in $REQUIRED_FILES; do
  if [ ! -f "$ROOT/$FILE" ]; then
    ISSUES="${ISSUES}
- Missing file: $FILE"
  fi
done

if [ ! -s "$ROOT/README.md" ] || ! grep -qi "reorganizes V1 into a structured layout" "$ROOT/README.md"; then
  ISSUES="${ISSUES}
- README.md is missing the required brief description."
fi

printf '%s\n\n' "cat-fortune-v2 skeleton check"

printf '%s\n' "Directories:"
for DIR in $REQUIRED_DIRS; do
  printf '%s\n' "- $DIR"
done

printf '\n%s\n' "Files:"
for FILE in $REQUIRED_FILES; do
  printf '%s\n' "- $FILE"
done

if [ -n "$ISSUES" ]; then
  printf '\n%s%s\n' "Issues:" "$ISSUES"
  exit 1
fi

printf '\n%s\n' "All checks passed."

