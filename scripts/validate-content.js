const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const contentDir = path.join(root, "content");

const expectedFiles = [
  "meta.json",
  "taxonomy.json",
  "shops.json",
  "ingredients.json",
  "issues.json",
  "half-success-hints.json",
  "success-wisdom.json",
  "nonsense-slips.json",
  "failure-penalties.json",
  "ui-copy.json",
];

const data = {};
const validationIssues = [];

function addIssue(message) {
  validationIssues.push(message);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function typeName(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function requireObject(fileName) {
  if (!isPlainObject(data[fileName])) {
    addIssue(`${fileName} must contain a top-level object.`);
    return false;
  }
  return true;
}

function requireArray(fileName, key) {
  if (!requireObject(fileName)) return [];
  const value = data[fileName][key];
  if (!Array.isArray(value)) {
    addIssue(`${fileName} must contain "${key}" as an array; found ${typeName(value)}.`);
    return [];
  }
  return value;
}

function requireFields(fileName, obj, fields, context) {
  for (const field of fields) {
    if (!(field in obj)) {
      addIssue(`${fileName} ${context} is missing required field "${field}".`);
    }
  }
}

function requireStringFields(fileName, obj, fields, context) {
  for (const field of fields) {
    if (field in obj && typeof obj[field] !== "string") {
      addIssue(`${fileName} ${context} field "${field}" must be a string; found ${typeName(obj[field])}.`);
    }
  }
}

function requireNumberFields(fileName, obj, fields, context) {
  for (const field of fields) {
    if (field in obj && typeof obj[field] !== "number") {
      addIssue(`${fileName} ${context} field "${field}" must be a number; found ${typeName(obj[field])}.`);
    }
  }
}

function requireBooleanFields(fileName, obj, fields, context) {
  for (const field of fields) {
    if (field in obj && typeof obj[field] !== "boolean") {
      addIssue(`${fileName} ${context} field "${field}" must be a boolean; found ${typeName(obj[field])}.`);
    }
  }
}

function requireUniqueIds(fileName, items, label) {
  const seen = new Set();
  for (const [index, item] of items.entries()) {
    if (!isPlainObject(item)) {
      addIssue(`${fileName} ${label}[${index}] must be an object; found ${typeName(item)}.`);
      continue;
    }
    if (typeof item.id !== "string" || item.id.trim() === "") {
      addIssue(`${fileName} ${label}[${index}] must have a non-empty string id.`);
      continue;
    }
    if (seen.has(item.id)) {
      addIssue(`${fileName} contains duplicate ${label} id "${item.id}".`);
    }
    seen.add(item.id);
  }
  return seen;
}

function loadJsonFiles() {
  if (!fs.existsSync(contentDir)) {
    addIssue(`Missing content directory: ${contentDir}`);
    return;
  }

  const jsonFiles = fs.readdirSync(contentDir).filter((file) => file.endsWith(".json")).sort();
  for (const fileName of jsonFiles) {
    const filePath = path.join(contentDir, fileName);
    try {
      data[fileName] = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
      addIssue(`${fileName} failed to parse: ${error.message}`);
    }
  }

  for (const fileName of expectedFiles) {
    if (!(fileName in data)) {
      addIssue(`Missing expected content file: ${fileName}`);
    }
  }
}

function validateMeta() {
  const fileName = "meta.json";
  if (!requireObject(fileName)) return;

  const required = ["project_id", "title", "version", "design_resolution", "theme_keywords", "default_locale"];
  requireFields(fileName, data[fileName], required, "root");
  requireStringFields(fileName, data[fileName], ["project_id", "title", "version", "design_resolution", "default_locale"], "root");

  if ("theme_keywords" in data[fileName]) {
    const keywords = data[fileName].theme_keywords;
    if (!Array.isArray(keywords) || keywords.some((item) => typeof item !== "string")) {
      addIssue(`${fileName} root field "theme_keywords" must be an array of strings.`);
    }
  }
}

function validateTaxonomy() {
  const categories = requireArray("taxonomy.json", "categories");
  const taxonomyCategoryPairs = new Set();
  const assignedIssueIds = [];

  for (const [index, category] of categories.entries()) {
    const context = `categories[${index}]`;
    if (!isPlainObject(category)) {
      addIssue(`taxonomy.json ${context} must be an object; found ${typeName(category)}.`);
      continue;
    }

    requireFields("taxonomy.json", category, ["id", "name", "order", "children"], context);
    requireStringFields("taxonomy.json", category, ["id", "name"], context);
    requireNumberFields("taxonomy.json", category, ["order"], context);

    if (!Array.isArray(category.children)) {
      addIssue(`taxonomy.json ${context} field "children" must be an array.`);
      continue;
    }

    for (const [childIndex, child] of category.children.entries()) {
      const childContext = `${context}.children[${childIndex}]`;
      if (!isPlainObject(child)) {
        addIssue(`taxonomy.json ${childContext} must be an object; found ${typeName(child)}.`);
        continue;
      }

      requireFields("taxonomy.json", child, ["id", "name", "order", "issues"], childContext);
      requireStringFields("taxonomy.json", child, ["id", "name"], childContext);
      requireNumberFields("taxonomy.json", child, ["order"], childContext);
      if (!Array.isArray(child.issues)) {
        addIssue(`taxonomy.json ${childContext} field "issues" must be an array.`);
        continue;
      }

      taxonomyCategoryPairs.add(`${category.id}/${child.id}`);
      for (const issueId of child.issues) {
        if (typeof issueId !== "string") {
          addIssue(`taxonomy.json ${childContext} contains a non-string issue id.`);
          continue;
        }
        assignedIssueIds.push(issueId);
      }
    }
  }

  return { taxonomyCategoryPairs, assignedIssueIds };
}

function validateShops() {
  const shops = requireArray("shops.json", "shops");
  for (const [index, shop] of shops.entries()) {
    const context = `shops[${index}]`;
    if (!isPlainObject(shop)) {
      addIssue(`shops.json ${context} must be an object; found ${typeName(shop)}.`);
      continue;
    }
    requireFields("shops.json", shop, ["id", "name", "short_name", "order"], context);
    requireStringFields("shops.json", shop, ["id", "name", "short_name"], context);
    requireNumberFields("shops.json", shop, ["order"], context);
  }
  return requireUniqueIds("shops.json", shops, "shops");
}

function validateSimpleArrays() {
  const ingredients = requireArray("ingredients.json", "ingredients");
  const issues = requireArray("issues.json", "issues");
  const halfSuccessHints = requireArray("half-success-hints.json", "half_success_hints");
  const successWisdom = requireArray("success-wisdom.json", "success_wisdom");
  requireArray("nonsense-slips.json", "nonsense_slips");
  const failurePenalties = requireArray("failure-penalties.json", "failure_penalties");
  requireObject("ui-copy.json");

  const ingredientIds = requireUniqueIds("ingredients.json", ingredients, "ingredients");
  const issueIds = requireUniqueIds("issues.json", issues, "issues");
  const halfSuccessHintIds = requireUniqueIds("half-success-hints.json", halfSuccessHints, "half_success_hints");
  const successWisdomIds = requireUniqueIds("success-wisdom.json", successWisdom, "success_wisdom");
  const failurePenaltyIds = requireUniqueIds("failure-penalties.json", failurePenalties, "failure_penalties");

  for (const [index, issue] of issues.entries()) {
    const context = `issues[${index}]`;
    if (!isPlainObject(issue)) continue;
    requireFields("issues.json", issue, [
      "id",
      "title",
      "title_display",
      "category_lv1_id",
      "category_lv2_id",
      "shop_id",
      "recipe",
      "food_name",
      "riddle_text",
      "success_wisdom_id",
      "half_success_hint_id",
      "special_case",
      "is_live",
      "order",
      "source_notes",
      "needs_review",
    ], context);
    requireStringFields("issues.json", issue, [
      "id",
      "title",
      "title_display",
      "category_lv1_id",
      "category_lv2_id",
      "shop_id",
      "food_name",
      "riddle_text",
      "success_wisdom_id",
      "half_success_hint_id",
    ], context);
    requireNumberFields("issues.json", issue, ["order"], context);
    requireBooleanFields("issues.json", issue, ["is_live", "needs_review"], context);
    if (!Array.isArray(issue.recipe) || issue.recipe.length !== 2 || issue.recipe.some((id) => typeof id !== "string")) {
      addIssue(`issues.json ${context} field "recipe" must be an array of two ingredient ids.`);
    }
    if (!isPlainObject(issue.source_notes)) {
      addIssue(`issues.json ${context} field "source_notes" must be an object.`);
    }
  }

  return {
    ingredients,
    issues,
    halfSuccessHints,
    successWisdom,
    failurePenalties,
    ingredientIds,
    issueIds,
    halfSuccessHintIds,
    successWisdomIds,
    failurePenaltyIds,
  };
}

function validateCrossFileReferences(base, taxonomyInfo, shopIds) {
  const {
    issues,
    halfSuccessHints,
    successWisdom,
    failurePenalties,
    ingredientIds,
    issueIds,
    halfSuccessHintIds,
    successWisdomIds,
  } = base;
  const { taxonomyCategoryPairs, assignedIssueIds } = taxonomyInfo;

  const taxonomyAssignmentCounts = new Map();
  for (const issueId of assignedIssueIds) {
    taxonomyAssignmentCounts.set(issueId, (taxonomyAssignmentCounts.get(issueId) || 0) + 1);
    if (!issueIds.has(issueId)) {
      addIssue(`taxonomy.json references unknown issue id "${issueId}".`);
    }
  }

  for (const issue of issues) {
    if (!isPlainObject(issue)) continue;

    const categoryPair = `${issue.category_lv1_id}/${issue.category_lv2_id}`;
    if (!taxonomyCategoryPairs.has(categoryPair)) {
      addIssue(`issues.json ${issue.id} references missing taxonomy category pair "${categoryPair}".`);
    }

    const assignmentCount = taxonomyAssignmentCounts.get(issue.id) || 0;
    if (assignmentCount !== 1) {
      addIssue(`issues.json ${issue.id} must appear exactly once in taxonomy children issue lists; found ${assignmentCount}.`);
    }

    if (!shopIds.has(issue.shop_id)) {
      addIssue(`issues.json ${issue.id} references missing shop_id "${issue.shop_id}".`);
    }

    if (Array.isArray(issue.recipe)) {
      for (const ingredientId of issue.recipe) {
        if (!ingredientIds.has(ingredientId)) {
          addIssue(`issues.json ${issue.id} recipe references missing ingredient id "${ingredientId}".`);
        }
      }
    }

    if (!successWisdomIds.has(issue.success_wisdom_id)) {
      addIssue(`issues.json ${issue.id} references missing success_wisdom_id "${issue.success_wisdom_id}".`);
    }

    if (!halfSuccessHintIds.has(issue.half_success_hint_id)) {
      addIssue(`issues.json ${issue.id} references missing half_success_hint_id "${issue.half_success_hint_id}".`);
    }
  }

  const issuesById = new Map(issues.filter(isPlainObject).map((issue) => [issue.id, issue]));

  for (const hint of halfSuccessHints) {
    if (!isPlainObject(hint)) continue;
    if (!issueIds.has(hint.issue_id)) {
      addIssue(`half-success-hints.json ${hint.id || "(missing id)"} references missing issue_id "${hint.issue_id}".`);
      continue;
    }

    const issue = issuesById.get(hint.issue_id);
    const repeatedIngredient = Array.isArray(issue.recipe) && issue.recipe.length === 2 && issue.recipe[0] === issue.recipe[1];
    if (repeatedIngredient && hint.type !== "shared") {
      addIssue(`half-success-hints.json ${hint.id} must use type "shared" because ${hint.issue_id} repeats the same ingredient.`);
    }
    if (!repeatedIngredient && hint.type !== "dual") {
      addIssue(`half-success-hints.json ${hint.id} must use type "dual" because ${hint.issue_id} uses two different ingredients.`);
    }
  }

  for (const entry of successWisdom) {
    if (!isPlainObject(entry)) continue;
    if (!issueIds.has(entry.issue_id)) {
      addIssue(`success-wisdom.json ${entry.id || "(missing id)"} references missing issue_id "${entry.issue_id}".`);
    }
  }

  const totalPenaltyWeight = failurePenalties.reduce((sum, penalty) => {
    return sum + (isPlainObject(penalty) && typeof penalty.weight === "number" ? penalty.weight : 0);
  }, 0);
  if (totalPenaltyWeight !== 100) {
    addIssue(`failure-penalties.json weights must sum to 100; found ${totalPenaltyWeight}.`);
  }
}

function printReport() {
  console.log("Content validation report");
  console.log("");

  const parsedFiles = Object.keys(data).sort();
  if (parsedFiles.length) {
    console.log("Parsed files:");
    for (const fileName of parsedFiles) {
      const value = data[fileName];
      const keys = isPlainObject(value) ? Object.keys(value).join(", ") || "(none)" : `(top-level ${typeName(value)})`;
      console.log(`- ${fileName}: ${keys}`);
    }
  } else {
    console.log("Parsed files: none");
  }

  console.log("");
  if (validationIssues.length) {
    console.log("Validation failed:");
    for (const issue of validationIssues) {
      console.log(`- ${issue}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Validation passed.");
}

loadJsonFiles();
validateMeta();
const taxonomyInfo = validateTaxonomy();
const shopIds = validateShops();
const base = validateSimpleArrays();
validateCrossFileReferences(base, taxonomyInfo, shopIds);
printReport();
