# Content Guide

How to swap placeholder content for the real thing. Every page shares the same
header/nav/footer markup and `assets/css/styles.css` — you generally only need
to edit the text inside `<main>` on each page.

## Repo layout

The site uses one folder per page, each with an `index.html`, so URLs are clean
(`/scholarship/`, `/cv/`, etc.). Paths in the HTML are **root-relative**
(they start with `/`), so they work identically no matter how deep the page is.

```
/                                     → index.html (home / About)
/scholarship/                         → scholarship/index.html
/learning-design/                     → learning-design/index.html
/reflections/                         → reflections/index.html
/reflections/<post-slug>/             → reflections/<post-slug>/index.html
/cv/                                  → cv/index.html
assets/css/styles.css                 design tokens + all styling
assets/js/script.js                   (empty placeholder for future JS)
assets/images/                        all images
assets/cv.pdf                         downloadable CV
design/                               design references (not part of the site)
docs/                                 dev docs (this guide)
```

## Colors, fonts, spacing

All design tokens live at the top of `assets/css/styles.css` under
`:root { ... }`. Change a color or font there and it updates across every page.

## Homepage (`index.html`)

- **Hero headline/subhead/CTAs**: edit the text inside `.hero-text`.
- **Collage visual**: `.collage-photo` shows a landscape photo. To swap it,
  replace the image file in `assets/images/` and update the `src`:
  ```html
  <img class="collage-photo" src="/assets/images/hero-landscape.png" alt="Describe the photo">
  ```
- **Welcome / About / Philosophy sections**: replace the placeholder
  paragraphs with your actual purpose/audience statement, bio, and
  philosophy/values/goals statement (see `.claude/CLAUDE.md` for the EDAE 521
  requirements these map to).

## Scholarship / Learning Design / Reflections

Each page uses a repeating block you can copy/paste for each new item:

- Scholarship & Reflections: `<article class="entry">...</article>`
- Learning Design: `<article class="case-study">...</article>`
  (keep the six `.case-study-part` blocks: Problem, Learners/Context,
  Evidence/Theory, Design Decisions, Artifact, Outcomes/Reflection)

## Adding a new top-level page

1. Create `<slug>/index.html` (copy an existing page for the shared
   header/nav/footer).
2. Add the nav link — root-relative, e.g. `<a href="/<slug>/">Label</a>` — to
   **every** page's nav so it stays consistent.
3. On the new page, set `aria-current="page"` on its own nav link.

## Adding a reflection post

1. Create `reflections/<post-slug>/index.html`.
2. Link to it from `reflections/index.html` with
   `href="/reflections/<post-slug>/"`.

## CV (`cv/index.html`)

- The real CV lives at `assets/cv.pdf` — the download button already points to
  `/assets/cv.pdf`. Replace that file to update the download.
- Replace the placeholder paragraphs in each `.cv-block` with real content.

## Images

Put all images in `assets/images/`. Reference them from any page as
`/assets/images/filename` (root-relative, so the same path works everywhere).
