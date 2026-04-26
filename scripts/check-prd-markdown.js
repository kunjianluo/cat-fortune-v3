const fs = require("fs");
const path = require("path");

const markdownPath = path.resolve(__dirname, "../../_source_docs/《猫猫占卜》PRD_0424.md");

function findSection(lines, headingPattern) {
  const start = lines.findIndex((line) => headingPattern.test(line));
  if (start === -1) {
    return { found: false, text: "", start: -1, end: -1 };
  }

  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) {
      end = index;
      break;
    }
  }

  return {
    found: true,
    text: lines.slice(start, end).join("\n"),
    start,
    end,
  };
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

function printResult(label, ok, detail) {
  const status = ok ? "PASS" : "FAIL";
  console.log(`- ${label}: ${status}${detail ? ` (${detail})` : ""}`);
}

const issues = [];
let exists = false;
let size = 0;
let text = "";

if (fs.existsSync(markdownPath)) {
  exists = true;
  size = fs.statSync(markdownPath).size;
  text = fs.readFileSync(markdownPath, "utf8");
} else {
  issues.push(`Markdown file not found: ${markdownPath}`);
}

const lines = text.split(/\r?\n/);
const appendixSections = {
  "附录一": findSection(lines, /^##\s+附录一/),
  "附录二": findSection(lines, /^##\s+附录二/),
  "附录三": findSection(lines, /^##\s+附录三/),
  "附录四": findSection(lines, /^##\s+附录四/),
};

const missingAppendices = Object.entries(appendixSections)
  .filter(([, section]) => !section.found)
  .map(([name]) => name);

const expectedIssueIds = Array.from({ length: 40 }, (_, index) => `Q${String(index + 1).padStart(2, "0")}`);
const missingIssueIds = expectedIssueIds.filter((id) => !new RegExp(`\\b${id}\\b`).test(text));

const appendixOneIssueEntries = countMatches(appendixSections["附录一"].text, /^###\s+Q\d{2}/gm);
const appendixTwoEntries = countMatches(appendixSections["附录二"].text, /^-\s+“.+”\s*$/gm);
const appendixThreeIssueEntries = countMatches(appendixSections["附录三"].text, /^###\s+Q\d{2}/gm);
const appendixFourIngredientEntries = countMatches(appendixSections["附录四"].text, /^-\s*[^：\n]+：.+$/gm);

if (!exists) issues.push("Markdown file must exist.");
if (exists && size === 0) issues.push("Markdown file must be non-empty.");
if (missingAppendices.length) issues.push(`Missing appendix headings: ${missingAppendices.join(", ")}`);
if (missingIssueIds.length) issues.push(`Missing issue ids: ${missingIssueIds.join(", ")}`);
if (appendixOneIssueEntries < 40) issues.push(`Appendix one has ${appendixOneIssueEntries} Q entries; expected at least 40.`);
if (appendixTwoEntries < 15) issues.push(`Appendix two has ${appendixTwoEntries} nonsense-slip entries; expected at least 15.`);
if (appendixThreeIssueEntries < 40) issues.push(`Appendix three has ${appendixThreeIssueEntries} Q entries; expected at least 40.`);
if (appendixFourIngredientEntries < 18) issues.push(`Appendix four has ${appendixFourIngredientEntries} ingredient entries; expected at least 18.`);

console.log("PRD Markdown completeness check");
console.log("");
console.log(`Path: ${markdownPath}`);
printResult("Markdown file exists", exists);
printResult("Markdown file is non-empty", size > 0, `${size} bytes`);
console.log("");
console.log("Appendix headings:");
for (const [name, section] of Object.entries(appendixSections)) {
  printResult(name, section.found);
}
console.log("");
console.log(`Missing issue ids: ${missingIssueIds.length ? missingIssueIds.join(", ") : "none"}`);
console.log("");
console.log("Counts:");
console.log(`- Appendix one Q entries: ${appendixOneIssueEntries}`);
console.log(`- Appendix two nonsense-slip entries: ${appendixTwoEntries}`);
console.log(`- Appendix three Q entries: ${appendixThreeIssueEntries}`);
console.log(`- Appendix four ingredient entries: ${appendixFourIngredientEntries}`);
console.log("");

if (issues.length) {
  console.log("FAIL");
  for (const issue of issues) {
    console.log(`- ${issue}`);
  }
  process.exitCode = 1;
} else {
  console.log("PASS");
}

