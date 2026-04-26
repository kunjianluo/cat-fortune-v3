const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const requiredDirs = [
  ".",
  "docs",
  "content",
  "schemas",
  "scripts",
  "assets",
  "assets/audio",
  "assets/images",
  "assets/sprites",
];

const requiredFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "README.md",
  "docs/prd-v2-summary.md",
  "docs/flow-opening.md",
  "docs/flow-tag-selection.md",
  "docs/flow-shop-and-sacrifice.md",
  "docs/flow-results.md",
  "docs/state-machine.md",
  "docs/decision-log.md",
  "docs/scope.md",
];

const issues = [];

for (const dir of requiredDirs) {
  const target = path.join(root, dir);
  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    issues.push(`Missing directory: ${dir}`);
  }
}

for (const file of requiredFiles) {
  const target = path.join(root, file);
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    issues.push(`Missing file: ${file}`);
  }
}

const readmePath = path.join(root, "README.md");
const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf8").trim() : "";
if (!readme || !/reorganizes V1 into a structured layout/i.test(readme)) {
  issues.push("README.md is missing the required brief description.");
}

console.log("cat-fortune-v2 skeleton check");
console.log("");
console.log("Directories:");
for (const dir of requiredDirs) {
  console.log(`- ${dir}`);
}
console.log("");
console.log("Files:");
for (const file of requiredFiles) {
  console.log(`- ${file}`);
}
console.log("");

if (issues.length) {
  console.log("Issues:");
  for (const issue of issues) {
    console.log(`- ${issue}`);
  }
  process.exitCode = 1;
} else {
  console.log("All checks passed.");
}

