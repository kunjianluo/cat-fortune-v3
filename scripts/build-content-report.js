const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const contentDir = path.join(root, "content");

function loadJson(fileName) {
  const filePath = path.join(contentDir, fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

const taxonomy = loadJson("taxonomy.json");
const shops = loadJson("shops.json");
const ingredients = loadJson("ingredients.json");
const issues = loadJson("issues.json");
const halfSuccessHints = loadJson("half-success-hints.json");
const successWisdom = loadJson("success-wisdom.json");
const nonsenseSlips = loadJson("nonsense-slips.json");
const failurePenalties = loadJson("failure-penalties.json");

const categoryGroups = asArray(taxonomy.categories);
const childCategories = categoryGroups.reduce((sum, category) => {
  return sum + asArray(category.children).length;
}, 0);

const counts = {
  "category groups": categoryGroups.length,
  "child categories": childCategories,
  shops: asArray(shops.shops).length,
  ingredients: asArray(ingredients.ingredients).length,
  issues: asArray(issues.issues).length,
  "half-success hints": asArray(halfSuccessHints.half_success_hints).length,
  "success wisdom entries": asArray(successWisdom.success_wisdom).length,
  "nonsense slips": asArray(nonsenseSlips.nonsense_slips).length,
  "failure penalties": asArray(failurePenalties.failure_penalties).length
};

console.log("Content completeness report");
console.log("");
for (const [label, count] of Object.entries(counts)) {
  console.log(`- ${label}: ${count}`);
}

console.log("");
console.log("Summary:");
console.log(`- Base shop map is ${counts.shops > 0 ? "started" : "empty"}.`);
console.log(`- Core issue dataset is ${counts.issues >= 40 ? "fully populated for V2" : counts.issues === 0 ? "not filled yet" : "in progress"}.`);
console.log(`- Ingredient layer is ${counts.ingredients >= 18 ? "fully populated with the PRD core set" : counts.ingredients === 0 ? "placeholder-only" : "partially filled"}.`);
console.log(`- Result text layers are ${counts["success wisdom entries"] >= counts.issues && counts.issues > 0 ? "aligned with issues" : "still incomplete"}.`);
console.log(`- Failure fallback layer has ${counts["failure penalties"]} penalty entries.`);
