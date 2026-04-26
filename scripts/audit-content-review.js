const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const contentDir = path.join(root, "content");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8"));
}

function listIds(items) {
  return items.map((item) => item.id).join(", ") || "none";
}

const issues = readJson("issues.json").issues || [];
const taxonomy = readJson("taxonomy.json").categories || [];
const uiCopy = readJson("ui-copy.json");

const reviewIssues = issues.filter((issue) => issue.needs_review === true);
const inferredTitles = issues.filter((issue) => issue.source_notes && issue.source_notes.title_source === "inferred");
const generatedOrPlaceholderRiddles = issues.filter((issue) => {
  const source = issue.source_notes && issue.source_notes.riddle_source;
  return source === "generated-from-ingredient-descriptions" || source === "placeholder" || source === "inferred";
});
const inferredTaxonomy = issues.filter((issue) => issue.source_notes && issue.source_notes.taxonomy_source === "inferred");

const emptyCategories = [];
for (const category of taxonomy) {
  for (const child of category.children || []) {
    if (!Array.isArray(child.issues) || child.issues.length === 0) {
      emptyCategories.push(`${category.id}/${child.id}`);
    }
  }
}

const requiredUiSections = [
  "opening",
  "intro",
  "card_selection",
  "shop_street",
  "shop_interior",
  "sacrifice",
  "half_success",
  "failure",
  "success",
  "collection",
];
const missingUiSections = requiredUiSections.filter((section) => {
  return !uiCopy || typeof uiCopy !== "object" || !uiCopy[section] || typeof uiCopy[section] !== "object";
});

const directTitleCount = issues.filter((issue) => issue.source_notes && issue.source_notes.title_source === "direct").length;
const inferredTitleCount = inferredTitles.length;
const directRiddleCount = issues.filter((issue) => issue.source_notes && issue.source_notes.riddle_source === "direct").length;
const generatedRiddleCount = generatedOrPlaceholderRiddles.length;
const directTaxonomyCount = issues.filter((issue) => issue.source_notes && issue.source_notes.taxonomy_source === "direct").length;
const inferredTaxonomyCount = inferredTaxonomy.length;

console.log("Content review audit");
console.log("");
console.log(`Total issues: ${issues.length}`);
console.log(`Needs review: ${reviewIssues.length}`);
console.log("");
console.log("Source status:");
console.log(`- Direct titles: ${directTitleCount}`);
console.log(`- Inferred titles: ${inferredTitleCount}`);
console.log(`- Direct riddles: ${directRiddleCount}`);
console.log(`- Generated/placeholder riddles: ${generatedRiddleCount}`);
console.log(`- Direct taxonomy assignments: ${directTaxonomyCount}`);
console.log(`- Inferred taxonomy assignments: ${inferredTaxonomyCount}`);
console.log("");
console.log(`Issues with inferred titles: ${listIds(inferredTitles)}`);
console.log(`Issues with inferred/generated riddle text: ${listIds(generatedOrPlaceholderRiddles)}`);
console.log(`Issues with inferred taxonomy: ${listIds(inferredTaxonomy)}`);
console.log("");
console.log(`Empty taxonomy categories: ${emptyCategories.length ? emptyCategories.join(", ") : "none"}`);
console.log(`Missing ui-copy sections: ${missingUiSections.length ? missingUiSections.join(", ") : "none"}`);
console.log("");
console.log("Audit complete.");

