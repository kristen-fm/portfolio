#!/usr/bin/env node
// Dev-only file watcher. Reruns `node build.js` whenever anything under src/
// changes, so editing a source file and refreshing the browser is enough to
// see the change — no manual build step. Not used by the production build or
// by GitHub Pages; it only shells out to the same build.js everyone else runs.
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC_DIR = path.join(ROOT, "src");
const DEBOUNCE_MS = 100;

let pending = null; // debounce timer
let building = false; // a build is currently running
let queued = false; // a change arrived while building; rebuild once it finishes

function runBuild() {
  if (building) {
    queued = true;
    return;
  }
  building = true;
  execFile("node", ["build.js"], { cwd: ROOT }, (err, stdout, stderr) => {
    building = false;
    if (stdout.trim()) process.stdout.write(stdout);
    if (stderr.trim()) process.stderr.write(stderr);
    if (err) console.error("Build failed — fix the error above and save again.");
    if (queued) {
      queued = false;
      runBuild();
    }
  });
}

function scheduleBuild() {
  clearTimeout(pending);
  pending = setTimeout(runBuild, DEBOUNCE_MS);
}

if (!fs.existsSync(SRC_DIR)) {
  console.error("Cannot find src/ — run this from the project root (node watch.js).");
  process.exit(1);
}

console.log("Watching src/ for changes. Press Ctrl+C to stop.");
runBuild(); // build once on startup so the site is current immediately

// fs.watch with { recursive: true } covers nested dirs on macOS and Windows.
fs.watch(SRC_DIR, { recursive: true }, (_event, filename) => {
  if (filename) console.log(`changed: src/${filename}`);
  scheduleBuild();
});
