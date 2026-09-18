#!/usr/bin/env node
// Static site build script. Renders src/data/*.js + src/content/**/*.html into
// the static HTML files GitHub Pages serves. No dependencies beyond Node's
// built-in fs/path. See docs/CONTENT-GUIDE.md for how to add content.
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const MANIFEST_PATH = path.join(ROOT, ".build-manifest.json");

const home = require("./src/data/home");
const scholarship = require("./src/data/scholarship");
const reflections = require("./src/data/reflections");
const learningDesign = require("./src/data/learning-design");
const cv = require("./src/data/cv");

const { renderHomePage } = require("./src/templates/pages/home");
const { renderScholarshipIndex } = require("./src/templates/pages/scholarshipIndex");
const { renderReflectionsIndex } = require("./src/templates/pages/reflectionsIndex");
const { renderLearningDesignIndex } = require("./src/templates/pages/learningDesignIndex");
const { renderCvPage } = require("./src/templates/pages/cvPage");
const { renderPostPage } = require("./src/templates/components/post");

const SECTIONS = [
  { name: "scholarship", entries: scholarship },
  { name: "reflections", entries: reflections },
];

// The only output paths build.js is ever allowed to write to or delete.
// Anything outside this shape (including path-traversal segments) is
// rejected before any file is touched — this bounds both the generated
// output and what the manifest is allowed to reference.
const FIXED_TOP_LEVEL_PATHS = new Set([
  "index.html",
  "scholarship/index.html",
  "reflections/index.html",
  "learning-design/index.html",
  "cv/index.html",
]);

// Slugs become both a URL path segment and a directory name, so they must
// contain nothing that means something special in either context —
// specifically no "/", "\", "?", "#", ".", or uppercase (to keep URLs
// consistent). A slug like "test#fragment" would build successfully as a
// literal directory but resolve as a URL fragment in a browser, silently
// breaking the link.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const DETAIL_PATH_PATTERN = new RegExp(
  `^(scholarship|reflections)/(${SLUG_PATTERN.source.slice(1, -1)})/index\\.html$`
);

function isValidGeneratedPath(candidate) {
  if (typeof candidate !== "string") return false;
  if (path.isAbsolute(candidate)) return false;
  const segments = candidate.split("/");
  if (segments.some((seg) => seg === "" || seg === "." || seg === "..")) return false;
  if (FIXED_TOP_LEVEL_PATHS.has(candidate)) return true;
  if (!DETAIL_PATH_PATTERN.test(candidate)) return false;
  const resolved = path.resolve(ROOT, candidate);
  return resolved === path.join(ROOT, candidate) && resolved.startsWith(ROOT + path.sep);
}

function readFragment(relPath) {
  const fullPath = path.join(ROOT, "src", relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing content fragment: src/${relPath}`);
  }
  return fs.readFileSync(fullPath, "utf8");
}

function assertSafeSlug(slug, section) {
  if (!slug || typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
    throw new Error(
      `Invalid slug in ${section}: ${JSON.stringify(slug)} (slugs must be lowercase letters, digits, and hyphens only)`
    );
  }
  if (slug === "index") {
    throw new Error(`Slug "index" in ${section} would collide with the section's own index page`);
  }
}

// Internal links to an entry's own detail page are derived from its section
// and slug — the same route computation used for the output path — rather
// than trusted from the hand-authored `link.href`, so the two can never
// drift apart (e.g. after a slug rename).
function deriveSectionEntries(name, entries) {
  const seenSlugs = new Set();
  return entries.map((entry) => {
    if (!entry.detail) return entry;

    assertSafeSlug(entry.slug, name);
    if (seenSlugs.has(entry.slug)) {
      throw new Error(`Duplicate slug in ${name}: "${entry.slug}"`);
    }
    seenSlugs.add(entry.slug);

    if (entry.link.external) {
      throw new Error(
        `Entry with slug "${entry.slug}" in ${name} has both a detail page and an external link`
      );
    }

    const canonicalHref = `/${name}/${entry.slug}/`;
    return { ...entry, link: { ...entry.link, href: canonicalHref } };
  });
}

// Build the complete { outputPath -> html } map before writing anything, so a
// bad entry (duplicate slug, missing fragment, unsafe path) fails the whole
// build rather than leaving a half-written site on disk.
function buildOutputMap() {
  const outputs = new Map();

  function addOutput(outputPath, html) {
    const normalized = outputPath.replace(/\\/g, "/");
    if (!isValidGeneratedPath(normalized)) {
      throw new Error(`Refusing to write unsupported output path: ${normalized}`);
    }
    if (outputs.has(normalized)) {
      throw new Error(`Duplicate output path: ${normalized}`);
    }
    outputs.set(normalized, html);
  }

  const derivedByName = {};
  for (const { name, entries } of SECTIONS) {
    derivedByName[name] = deriveSectionEntries(name, entries);
  }

  const aboutHtml = readFragment(home.aboutFile);
  addOutput("index.html", renderHomePage(home, aboutHtml));
  addOutput("scholarship/index.html", renderScholarshipIndex(derivedByName.scholarship));
  addOutput("reflections/index.html", renderReflectionsIndex(derivedByName.reflections));
  addOutput("learning-design/index.html", renderLearningDesignIndex(learningDesign));
  addOutput("cv/index.html", renderCvPage(cv));

  for (const { name } of SECTIONS) {
    for (const entry of derivedByName[name]) {
      if (!entry.detail) continue;
      const bodyHtml = readFragment(entry.detail.bodyFile);
      const html = renderPostPage({ section: name, entry }, bodyHtml);
      addOutput(`${name}/${entry.slug}/index.html`, html);
    }
  }

  return outputs;
}

// Returns null if no manifest file exists yet. Throws if the manifest exists
// but is malformed or references a path outside the supported output shape
// (e.g. a path-traversal entry) — this file is only ever meant to be written
// by build(), so anything else in it is treated as corrupt, not trusted.
function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return null;
  const data = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  if (!Array.isArray(data)) {
    throw new Error(".build-manifest.json is corrupt: expected an array of paths");
  }
  for (const entry of data) {
    if (!isValidGeneratedPath(entry)) {
      throw new Error(`.build-manifest.json contains an unsupported or unsafe path: ${JSON.stringify(entry)}`);
    }
  }
  return data;
}

function writeManifest(paths) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(paths.sort(), null, 2) + "\n");
}

function check() {
  const outputs = buildOutputMap();
  const problems = [];

  if (!fs.existsSync(MANIFEST_PATH)) {
    problems.push(".build-manifest.json is missing (run node build.js once to create it)");
  }
  const manifestPaths = readManifest() || [];
  const manifestSet = new Set(manifestPaths);
  const currentPaths = new Set(outputs.keys());

  for (const [outputPath, html] of outputs) {
    const fullPath = path.join(ROOT, outputPath);
    if (!fs.existsSync(fullPath)) {
      problems.push(`missing: ${outputPath}`);
      continue;
    }
    const current = fs.readFileSync(fullPath, "utf8");
    if (current !== html) {
      problems.push(`stale: ${outputPath} (run node build.js to regenerate)`);
    }
  }

  for (const outputPath of currentPaths) {
    if (!manifestSet.has(outputPath)) {
      problems.push(`untracked: ${outputPath} (missing from .build-manifest.json; run node build.js)`);
    }
  }
  for (const oldPath of manifestSet) {
    if (!currentPaths.has(oldPath)) {
      problems.push(`orphaned: ${oldPath} (run node build.js to remove)`);
    }
  }

  if (problems.length > 0) {
    console.error("build.js --check failed:");
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exitCode = 1;
    return;
  }

  console.log(`build.js --check passed (${outputs.size} pages up to date).`);
}

function build() {
  const outputs = buildOutputMap();
  const previousManifest = readManifest() || [];
  const currentPaths = new Set(outputs.keys());

  for (const [outputPath, html] of outputs) {
    const fullPath = path.join(ROOT, outputPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, html);
  }

  let removed = 0;
  for (const oldPath of previousManifest) {
    if (currentPaths.has(oldPath)) continue;
    // oldPath is already validated by readManifest() against
    // isValidGeneratedPath(), so this can only resolve inside ROOT.
    const fullPath = path.join(ROOT, oldPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      removed += 1;
      const dir = path.dirname(fullPath);
      if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
    }
  }

  writeManifest([...currentPaths]);

  console.log(`Built ${outputs.size} pages.${removed ? ` Removed ${removed} orphaned page(s).` : ""}`);
}

const mode = process.argv.includes("--check") ? "check" : "build";
if (mode === "check") {
  check();
} else {
  build();
}
