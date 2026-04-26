const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const csvDir = path.join(root, "cat_fortune_csv_exports");
const outputPath = path.join(root, "content", "runtime-data.json");

const files = {
  seedIssues: "cat_fortune_v1_seed_issues.csv",
  issueMaster: "cat_fortune_issue_master_full.csv",
  recipes: "cat_fortune_recipes_and_half_success_hints.csv",
  wisdom: "cat_fortune_success_wisdom.csv",
  ingredients: "cat_fortune_ingredients.csv",
  shops: "cat_fortune_shops.csv",
  nonsense: "cat_fortune_nonsense_slips.csv",
  failurePenalties: "cat_fortune_failure_penalties.csv",
  flowStates: "cat_fortune_flow_states.csv",
  gameRules: "cat_fortune_game_rules.csv",
  uiCopy: "cat_fortune_ui_copy.csv",
  shopScenes: "cat_fortune_shop_scene_specs.csv",
  assetPlaceholders: "cat_fortune_asset_placeholders.csv",
  taxonomyReview: "cat_fortune_issue_taxonomy_review.csv",
  manifest: "cat_fortune_csv_manifest.csv",
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  text = text.replace(/^\uFEFF/, "");

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (inQuotes) {
      if (char === "\"" && next === "\"") {
        field += "\"";
        index += 1;
      } else if (char === "\"") {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === "\"") {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  const headers = rows.shift();
  if (!headers) return [];

  return rows
    .filter((cells) => cells.some((cell) => cell.trim() !== ""))
    .map((cells) => {
      const item = {};
      headers.forEach((header, index) => {
        item[header.trim()] = (cells[index] || "").trim();
      });
      return item;
    });
}

function readCsv(fileName) {
  const filePath = path.join(csvDir, fileName);
  return parseCsv(fs.readFileSync(filePath, "utf8"));
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function toBool(value) {
  return String(value).trim().toLowerCase() === "true";
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function assertUnique(rows, key, label, errors) {
  const seen = new Set();
  for (const row of rows) {
    const value = row[key];
    if (!value) {
      errors.push(`${label} row is missing ${key}.`);
      continue;
    }
    if (seen.has(value)) {
      errors.push(`${label} contains duplicate ${key}: ${value}`);
    }
    seen.add(value);
  }
}

function byKey(rows, key) {
  return new Map(rows.filter((row) => row[key]).map((row) => [row[key], row]));
}

function allCsvFiles() {
  return fs.readdirSync(csvDir)
    .filter((fileName) => fileName.endsWith(".csv"))
    .sort();
}

const sourceRows = Object.fromEntries(
  Object.entries(files).map(([key, fileName]) => [key, readCsv(fileName)]),
);

const errors = [];
const warnings = [];

assertUnique(sourceRows.seedIssues, "issue_id", "V1 seed issues", errors);
assertUnique(sourceRows.shops, "shop_id", "shops", errors);
assertUnique(sourceRows.ingredients, "ingredient_id", "ingredients", errors);
assertUnique(sourceRows.issueMaster, "issue_id", "full issue master", errors);
assertUnique(sourceRows.recipes, "issue_id", "recipes", errors);
assertUnique(sourceRows.wisdom, "issue_id", "success wisdom", errors);
assertUnique(sourceRows.nonsense, "slip_id", "nonsense slips", errors);

const shopById = byKey(sourceRows.shops, "shop_id");
const ingredientById = byKey(sourceRows.ingredients, "ingredient_id");
const ingredientByName = byKey(sourceRows.ingredients, "ingredient_name");
const issueById = byKey(sourceRows.issueMaster, "issue_id");
const recipeByIssue = byKey(sourceRows.recipes, "issue_id");
const wisdomByIssue = byKey(sourceRows.wisdom, "issue_id");

const ingredients_by_shop = {};
for (const row of sourceRows.ingredients) {
  if (!shopById.has(row.shop_id)) {
    errors.push(`Ingredient ${row.ingredient_id} references missing shop_id ${row.shop_id}.`);
  }
  if (!ingredients_by_shop[row.shop_id]) ingredients_by_shop[row.shop_id] = [];
  ingredients_by_shop[row.shop_id].push(row.ingredient_id);
}

const shops = sourceRows.shops.map((row) => ({
  id: row.shop_id,
  name: row.front_name,
  short_name: row.short_name,
  order: toNumber(row.order),
  position: row.position,
  description: row.description,
  door_type: row.door_type,
  door_motion: row.door_motion,
  sfx: row.sfx,
  npc: row.npc_cat,
  npc_description: row.npc_desc,
  ingredient_ids: ingredients_by_shop[row.shop_id] || [],
}));

const ingredients = sourceRows.ingredients.map((row) => ({
  id: row.ingredient_id,
  name: row.ingredient_name,
  shop_id: row.shop_id,
  shop_name: row.shop_name,
  short_name: row.short_name,
  description: row.short_desc,
  sprite_key: row.sprite_key,
  order: toNumber(row.display_order),
  is_active: toBool(row.is_active),
}));

function resolveIngredientId(id, name, context) {
  if (id && ingredientById.has(id)) return id;
  const ingredient = name ? ingredientByName.get(name) : null;
  if (ingredient) return ingredient.ingredient_id;
  errors.push(`${context} references missing ingredient ${id || name || "(blank)"}.`);
  return id || name || "";
}

function recipeIngredientIds(row, context) {
  return [
    resolveIngredientId(row.ingredient_a_id, row.ingredient_a, `${context} ingredient_a`),
    resolveIngredientId(row.ingredient_b_id, row.ingredient_b, `${context} ingredient_b`),
  ];
}

function deriveIssueShopId(issueRow, recipeIds) {
  if (issueRow.shop_id_if_same_shop) return issueRow.shop_id_if_same_shop;
  if (issueRow.ingredient_a_shop_id) return issueRow.ingredient_a_shop_id;
  const firstIngredient = ingredientById.get(recipeIds[0]);
  return firstIngredient ? firstIngredient.shop_id : "";
}

function availableIngredientsFor(shopId, recipeIds) {
  return unique([...(ingredients_by_shop[shopId] || []), ...recipeIds]);
}

const recipes = sourceRows.recipes.map((row) => {
  const ingredient_ids = recipeIngredientIds(row, `Recipe ${row.issue_id}`);
  const repeatedIngredient = ingredient_ids[0] === ingredient_ids[1];
  const type = repeatedIngredient ? "shared" : row.half_success_type || "dual";

  return {
    id: `recipe-${row.issue_id}`,
    issue_id: row.issue_id,
    ingredient_ids,
    ingredient_names: [row.ingredient_a, row.ingredient_b],
    food_name: row.food_name,
    half_success_type: type,
  };
});

const recipeRuntimeByIssue = new Map(recipes.map((recipe) => [recipe.issue_id, recipe]));

const half_success_hints = sourceRows.recipes.map((row) => {
  const recipe = recipeRuntimeByIssue.get(row.issue_id);
  const repeatedIngredient = recipe.ingredient_ids[0] === recipe.ingredient_ids[1];
  const type = repeatedIngredient ? "shared" : row.half_success_type || "dual";
  const matches = [
    {
      ingredient_id: recipe.ingredient_ids[0],
      label: row.hint_a_label,
      text: row.hint_a_text,
    },
  ];

  if (!repeatedIngredient) {
    matches.push({
      ingredient_id: recipe.ingredient_ids[1],
      label: row.hint_b_label,
      text: row.hint_b_text,
    });
  }

  return {
    id: `hint-${row.issue_id}`,
    issue_id: row.issue_id,
    type,
    matches,
    shared_hint: repeatedIngredient ? row.hint_a_text || row.hint_b_text : "",
  };
});

const success_wisdom = sourceRows.wisdom.map((row) => ({
  id: `wisdom-${row.issue_id}`,
  issue_id: row.issue_id,
  food_name: row.food_name,
  text: row.wisdom_text,
}));

const issues = sourceRows.issueMaster.map((row, index) => {
  const recipe = recipeRuntimeByIssue.get(row.issue_id);
  if (!recipe) errors.push(`Issue ${row.issue_id} is missing from recipes CSV.`);
  if (!wisdomByIssue.has(row.issue_id)) errors.push(`Issue ${row.issue_id} is missing from success wisdom CSV.`);

  const recipe_ids = recipe ? recipe.ingredient_ids : recipeIngredientIds(row, `Issue ${row.issue_id}`);
  const shop_id = deriveIssueShopId(row, recipe_ids);
  const recipe_spans_multiple_shops = toBool(row.recipe_spans_multiple_shops);

  if (shop_id && !shopById.has(shop_id)) {
    errors.push(`Issue ${row.issue_id} references missing shop_id ${shop_id}.`);
  }

  if (recipe_spans_multiple_shops) {
    warnings.push(`${row.issue_id} recipe spans shops (${row.ingredient_a_id}/${row.ingredient_a_shop_id}, ${row.ingredient_b_id}/${row.ingredient_b_shop_id}); default shop is ${shop_id}, with both recipe ingredients added to the playable list.`);
  }

  return {
    id: row.issue_id,
    title: row.canonical_title,
    title_source: row.title_source,
    riddle_text: row.canonical_riddle,
    riddle_source: row.riddle_source,
    internal_id_visible_to_player: toBool(row.internal_id_visible_to_player),
    shop_id,
    shop_name: row.shop_name_if_same_shop || shopById.get(shop_id)?.front_name || "",
    recipe_id: recipe ? recipe.id : `recipe-${row.issue_id}`,
    recipe_ingredient_ids: recipe_ids,
    available_ingredient_ids: availableIngredientsFor(shop_id, recipe_ids),
    half_success_hint_id: `hint-${row.issue_id}`,
    success_wisdom_id: `wisdom-${row.issue_id}`,
    food_name: recipe ? recipe.food_name : row.food_name,
    is_v1_seed: toBool(row.is_v1_seed),
    needs_manual_title: toBool(row.needs_manual_title),
    needs_manual_riddle: toBool(row.needs_manual_riddle),
    taxonomy: {
      level1_category: row.level1_category,
      level2_category: row.level2_category,
      source: row.taxonomy_source,
    },
    source_notes: row.notes,
    order: index + 1,
  };
});

for (const row of sourceRows.recipes) {
  if (!issueById.has(row.issue_id)) {
    errors.push(`Recipe ${row.issue_id} is not present in full issue master CSV.`);
  }
}

const seed_issues = sourceRows.seedIssues.map((row) => {
  const issue = issueById.get(row.issue_id);
  const recipe = recipeRuntimeByIssue.get(row.issue_id);
  const wisdom = wisdomByIssue.get(row.issue_id);
  const ingredient_ids = [
    resolveIngredientId("", row.ingredient_a, `Seed issue ${row.issue_id} ingredient_a`),
    resolveIngredientId("", row.ingredient_b, `Seed issue ${row.issue_id} ingredient_b`),
  ];
  const shop_id = row.shop_id || issue?.shop_id_if_same_shop || issue?.ingredient_a_shop_id || "";

  if (!issue) errors.push(`Seed issue ${row.issue_id} does not map to a full issue.`);
  if (!shopById.has(shop_id)) errors.push(`Seed issue ${row.issue_id} references missing shop_id ${shop_id}.`);
  if (!recipe) errors.push(`Seed issue ${row.issue_id} does not have a playable recipe.`);
  if (!wisdom) errors.push(`Seed issue ${row.issue_id} does not have success wisdom.`);

  return {
    id: row.issue_id,
    issue_id: row.issue_id,
    order: toNumber(row.v1_order),
    title: row.heart_knot_title,
    riddle_text: row.riddle_text,
    shop_id,
    shop_name: row.shop_name_v1,
    recipe_ingredient_ids: ingredient_ids,
    food_name: row.food_name,
    wisdom_text_v1: row.wisdom_text_v1,
    source: {
      doc: row.source_doc,
      section: row.source_section,
    },
  };
});

const nonsense_slips = sourceRows.nonsense.map((row) => ({
  id: row.slip_id,
  text: row.text,
  weight: toNumber(row.weight, 1),
  is_default_fallback: toBool(row.is_default_fallback),
}));

const failure_penalties = sourceRows.failurePenalties.map((row) => ({
  id: row.penalty_id,
  name: row.name,
  weight_percent: toNumber(row.weight_percent),
  active_in_v2_minimal: toBool(row.active_in_v2_minimal),
  ui_type: row.ui_type,
  trigger: row.trigger,
  interaction: row.interaction,
  return_condition: row.return_condition,
}));

const ui_copy = Object.fromEntries(sourceRows.uiCopy.map((row) => [row.copy_key, row.text]));
const game_rules = sourceRows.gameRules.map((row) => ({
  id: row.rule_id,
  version_scope: row.version_scope,
  description: row.description,
}));
const flow_states = sourceRows.flowStates.map((row) => ({
  id: row.state_id,
  version_scope: row.version_scope,
  screen: row.screen,
  description: row.description,
  entry_condition: row.entry_condition,
  exit_condition: row.exit_condition,
}));

const seedIssueIds = new Set(seed_issues.map((issue) => issue.issue_id));
const issueIds = new Set(issues.map((issue) => issue.id));
const recipeIssueIds = new Set(recipes.map((recipe) => recipe.issue_id));
const wisdomIssueIds = new Set(success_wisdom.map((entry) => entry.issue_id));
const hintIssueIds = new Set(half_success_hints.map((hint) => hint.issue_id));
const seedValidation = {
  all_map_to_full_issue: seed_issues.every((issue) => issueIds.has(issue.issue_id)),
  all_have_playable_recipe: seed_issues.every((issue) => recipeIssueIds.has(issue.issue_id)),
  all_have_success_wisdom: seed_issues.every((issue) => wisdomIssueIds.has(issue.issue_id)),
  all_have_half_success_hints: seed_issues.every((issue) => hintIssueIds.has(issue.issue_id)),
  missing_full_issue_ids: seed_issues.filter((issue) => !issueIds.has(issue.issue_id)).map((issue) => issue.issue_id),
  missing_recipe_issue_ids: seed_issues.filter((issue) => !recipeIssueIds.has(issue.issue_id)).map((issue) => issue.issue_id),
  missing_success_wisdom_issue_ids: seed_issues.filter((issue) => !wisdomIssueIds.has(issue.issue_id)).map((issue) => issue.issue_id),
  missing_half_success_hint_issue_ids: seed_issues.filter((issue) => !hintIssueIds.has(issue.issue_id)).map((issue) => issue.issue_id),
};

if (seed_issues.length !== 5) {
  warnings.push(`Expected 5 V1 seed issues; found ${seed_issues.length}.`);
}

for (const issue of issues) {
  for (const ingredientId of issue.recipe_ingredient_ids) {
    if (!ingredientById.has(ingredientId)) {
      errors.push(`Issue ${issue.id} recipe references missing ingredient_id ${ingredientId}.`);
    }
  }
  for (const ingredientId of issue.available_ingredient_ids) {
    if (!ingredientById.has(ingredientId)) {
      errors.push(`Issue ${issue.id} available list references missing ingredient_id ${ingredientId}.`);
    }
  }
}

const csvFiles = allCsvFiles();
const runtimeData = {
  meta: {
    project_id: "cat-fortune-v3",
    data_version: "csv-runtime-v3-seed-entry",
    generated_at: new Date().toISOString(),
    generated_by: "scripts/compile-csv-to-runtime.js",
    source_dir: "cat_fortune_csv_exports",
    source_files: Object.values(files),
    all_csv_files: csvFiles,
    row_counts: Object.fromEntries(
      Object.entries(files).map(([key, fileName]) => [fileName, sourceRows[key].length]),
    ),
    notes: [
      "Default gameplay starts from seed_issues, the five V1 heart-knot choices.",
      "The full 40 issue dataset remains in issues for future expansion.",
      "Cross-shop recipes keep both recipe ingredients in the playable ingredient list.",
    ],
    warnings,
    seed_issue_validation: seedValidation,
  },
  seed_issues,
  issues,
  shops,
  ingredients,
  ingredients_by_shop,
  recipes,
  half_success_hints,
  success_wisdom,
  nonsense_slips,
  failure_penalties,
  ui_copy,
  game_rules,
  flow_states,
  future_hooks: {
    shop_scene_specs: sourceRows.shopScenes,
    asset_placeholders: sourceRows.assetPlaceholders,
    taxonomy_review: sourceRows.taxonomyReview,
    csv_manifest: sourceRows.manifest,
  },
};

if (errors.length) {
  console.log("CSV compile failed:");
  for (const error of errors) console.log(`- ${error}`);
  process.exit(1);
}

fs.writeFileSync(outputPath, JSON.stringify(runtimeData, null, 2) + "\n");

console.log("CSV runtime compile report");
console.log("");
console.log("Consumed runtime CSV files:");
for (const fileName of Object.values(files)) console.log(`- ${fileName}`);
console.log("");
console.log(`Generated: ${path.relative(root, outputPath)}`);
console.log(`Seed issues: ${seed_issues.length}`);
console.log(`Full issues: ${issues.length}`);
console.log(`Shops: ${shops.length}`);
console.log(`Ingredients: ${ingredients.length}`);
console.log(`Recipes: ${recipes.length}`);
console.log(`Half-success hints: ${half_success_hints.length}`);
console.log(`Success wisdom entries: ${success_wisdom.length}`);
console.log(`Nonsense slips: ${nonsense_slips.length}`);
console.log("");
console.log("Seed issue validation:");
console.log(`- every seed issue maps to a valid full issue: ${seedValidation.all_map_to_full_issue ? "yes" : "no"}`);
console.log(`- every seed issue has a playable recipe: ${seedValidation.all_have_playable_recipe ? "yes" : "no"}`);
console.log(`- every seed issue has success wisdom: ${seedValidation.all_have_success_wisdom ? "yes" : "no"}`);
console.log(`- every seed issue has half-success hints: ${seedValidation.all_have_half_success_hints ? "yes" : "no"}`);
console.log("");
console.log(`Warnings: ${warnings.length}`);
for (const warning of warnings) console.log(`- ${warning}`);

if (seedIssueIds.size !== seed_issues.length) {
  console.log("- Duplicate seed issue ids were found after compilation.");
}
