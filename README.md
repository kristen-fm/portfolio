# kristen-foster-marks.github.io

Personal portfolio site, served by GitHub Pages at
[kristen-fm.com](https://kristen-fm.com).

## Build

Page content is generated from `src/` (data + content fragments + templates)
by `build.js`, a small script using only Node's built-in `fs`/`path` modules
— no npm dependencies, no `package.json`. The generated HTML files
(`index.html`, `scholarship/index.html`, `cv/index.html`, etc.) are committed
to the repo, so GitHub Pages keeps serving plain static HTML with no build
step at deploy time.

**Do not hand-edit the generated HTML files** — the next `node build.js` run
will overwrite them. Edit the corresponding file under `src/` instead. See
[`docs/CONTENT-GUIDE.md`](docs/CONTENT-GUIDE.md) for how to add or change
content.

Requires Node 18+ (any version with modern `fs`/`path` APIs; developed and
tested against Node 22).

```
node build.js            # regenerate all pages from src/, commit the result
node build.js --check    # verify the committed HTML matches src/ (no writes)
```

Run `node build.js --check` before every commit that touches `src/` — a
forgotten build silently publishes stale content even though the source is
correct. `build.js` also removes generated pages whose source entry was
deleted or renamed, tracked via the committed `.build-manifest.json`.

## Structure

One folder per page (each an `index.html`), so URLs stay clean. All paths in
the generated HTML are root-relative (they start with `/`).

```
build.js                       generates all pages below from src/
.build-manifest.json           tracks generated output, for orphan cleanup
src/
  data/                        page content as plain JS data (single source of truth)
  content/                     freeform narrative fragments (.html), referenced from data/
  templates/                   render functions — head/nav/footer shell + per-content-type templates
/                               index.html — home / About (generated)
scholarship/                   /scholarship/ (generated)
learning-design/                /learning-design/ (generated)
reflections/                   /reflections/  (+ one folder per post) (generated)
cv/                             /cv/ (generated)
assets/
  css/styles.css               all styling + design tokens (:root)
  js/script.js                 (empty placeholder for future JS)
  images/                      all images
  cv.pdf                       downloadable CV
design/                        design references (not served/linked)
docs/CONTENT-GUIDE.md          how to add/edit content
```

## Local preview

Serve from the repo root (root-relative paths need a server, not `file://`):

```
python3 -m http.server 8000
```

Then open http://localhost:8000/.

See [`docs/CONTENT-GUIDE.md`](docs/CONTENT-GUIDE.md) for how to add pages,
reflection posts, and images.
