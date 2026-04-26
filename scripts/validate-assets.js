const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "content", "asset-manifest.json");

const REQUIRED_FIELDS = [
  "id",
  "type",
  "scene",
  "path",
  "recommended_size",
  "status",
  "fallback",
  "required_for_v3_demo",
  "notes"
];

const VALID_TYPES = new Set(["image", "audio", "sprite"]);
const VALID_STATUSES = new Set(["placeholder", "missing", "ready"]);

function fail(message) {
  console.error(`Asset manifest error: ${message}`);
  process.exit(1);
}

function readManifest() {
  let raw;
  try {
    raw = fs.readFileSync(MANIFEST_PATH, "utf8");
  } catch (error) {
    fail(`cannot read ${path.relative(ROOT, MANIFEST_PATH)} (${error.message})`);
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    fail(`invalid JSON in ${path.relative(ROOT, MANIFEST_PATH)} (${error.message})`);
  }
}

function validateAsset(asset, index) {
  const label = asset && asset.id ? asset.id : `asset[${index}]`;
  const errors = [];

  if (!asset || typeof asset !== "object" || Array.isArray(asset)) {
    return {
      label,
      errors: [`asset[${index}] must be an object`],
      exists: false,
      absolutePath: ""
    };
  }

  for (const field of REQUIRED_FIELDS) {
    if (!(field in asset)) {
      errors.push(`missing required field "${field}"`);
    }
  }

  if ("id" in asset && (typeof asset.id !== "string" || asset.id.trim() === "")) {
    errors.push("id must be a non-empty string");
  }

  if ("type" in asset && !VALID_TYPES.has(asset.type)) {
    errors.push(`type must be one of: ${Array.from(VALID_TYPES).join(", ")}`);
  }

  if ("scene" in asset && (typeof asset.scene !== "string" || asset.scene.trim() === "")) {
    errors.push("scene must be a non-empty string");
  }

  if ("path" in asset && (typeof asset.path !== "string" || asset.path.trim() === "")) {
    errors.push("path must be a non-empty string");
  }

  if ("recommended_size" in asset && (typeof asset.recommended_size !== "string" || asset.recommended_size.trim() === "")) {
    errors.push("recommended_size must be a non-empty string");
  }

  if ("status" in asset && !VALID_STATUSES.has(asset.status)) {
    errors.push(`status must be one of: ${Array.from(VALID_STATUSES).join(", ")}`);
  }

  if ("fallback" in asset && (typeof asset.fallback !== "string" || asset.fallback.trim() === "")) {
    errors.push("fallback must be a non-empty string");
  }

  if ("required_for_v3_demo" in asset && typeof asset.required_for_v3_demo !== "boolean") {
    errors.push("required_for_v3_demo must be true or false");
  }

  if ("notes" in asset && typeof asset.notes !== "string") {
    errors.push("notes must be a string");
  }

  const absolutePath = typeof asset.path === "string" ? path.join(ROOT, asset.path) : "";
  const exists = absolutePath ? fs.existsSync(absolutePath) : false;

  if (
    asset.required_for_v3_demo === true &&
    asset.status === "ready" &&
    !exists
  ) {
    errors.push("required ready asset file does not exist");
  }

  return {
    label,
    errors,
    exists,
    absolutePath
  };
}

function main() {
  const manifest = readManifest();

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    fail("manifest root must be an object");
  }

  if (!Array.isArray(manifest.assets)) {
    fail('manifest must contain an "assets" array');
  }

  const seenIds = new Set();
  const reports = manifest.assets.map((asset, index) => {
    const report = validateAsset(asset, index);

    if (asset && typeof asset.id === "string") {
      if (seenIds.has(asset.id)) {
        report.errors.push(`duplicate asset id "${asset.id}"`);
      }
      seenIds.add(asset.id);
    }

    return report;
  });

  const missingFiles = reports.filter((report) => !report.exists).length;
  const invalidReports = reports.filter((report) => report.errors.length > 0);

  console.log("V3 asset manifest report");
  console.log(`Manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
  console.log(`Records: ${reports.length}`);
  console.log(`Existing files: ${reports.length - missingFiles}`);
  console.log(`Missing files: ${missingFiles}`);
  console.log("");

  for (const report of reports) {
    const asset = manifest.assets.find((item) => item && item.id === report.label);
    const status = asset && asset.status ? asset.status : "invalid";
    const required = asset && asset.required_for_v3_demo === true ? "required" : "optional";
    const existsText = report.exists ? "exists" : "missing file";
    const pathText = asset && asset.path ? asset.path : "(no path)";

    console.log(`- ${report.label} [${status}, ${required}, ${existsText}]`);
    console.log(`  ${pathText}`);

    for (const error of report.errors) {
      console.log(`  ERROR: ${error}`);
    }
  }

  if (invalidReports.length > 0) {
    console.error("");
    console.error(`Asset manifest validation failed with ${invalidReports.length} invalid record(s).`);
    process.exit(1);
  }

  console.log("");
  console.log("Asset manifest structure is valid.");
}

main();

