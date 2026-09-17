# kristen-foster-marks.github.io

Personal portfolio site, served by GitHub Pages at
[kristen-fm.com](https://kristen-fm.com).

## Structure

One folder per page (each an `index.html`), so URLs stay clean. All paths in the
HTML are root-relative (they start with `/`).

```
/                              index.html — home / About
scholarship/                   /scholarship/
learning-design/               /learning-design/
reflections/                   /reflections/  (+ one folder per post)
cv/                            /cv/
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
