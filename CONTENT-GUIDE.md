# Content Guide

How to swap placeholder content for the real thing. Every page shares the same
header/nav/footer markup and `styles.css` — you generally only need to edit the
text inside `<main>` on each page.

## Colors, fonts, spacing

All design tokens live at the top of `styles.css` under `:root { ... }`.
Change a color or font there and it updates across every page.

## Homepage (`index.html`)

- **Hero headline/subhead/CTAs**: edit the text inside `.hero-text`.
- **Collage visual**: the `.collage-photo` div is a placeholder box. Once you
  have a real landscape photo, replace it with:
  ```html
  <img class="collage-photo" src="images/hero-landscape.jpg" alt="Describe the photo">
  ```
  (drop the image file in `images/` first). Same idea for `.collage-note` and
  `.collage-tag` if you want to swap in a scanned pressed-flower graphic or a
  handwritten note image instead of text.
- **Welcome / About / Philosophy sections**: replace the placeholder
  paragraphs with your actual purpose/audience statement, bio, and
  philosophy/values/goals statement (see `.claude/CLAUDE.md` for the EDAE 521
  requirements these map to).

## Research & Scholarship / Learning Design & Practice / Reflections

Each page uses a repeating block you can copy/paste for each new item:

- Research & Reflections: `<article class="entry">...</article>`
- Learning Design & Practice: `<article class="case-study">...</article>`
  (keep the six `.case-study-part` blocks: Problem, Learners/Context,
  Evidence/Theory, Design Decisions, Artifact, Outcomes/Reflection)

Update the `aria-current="page"` attribute on the matching nav link if you add
new pages, and add the new link to every page's nav so it stays consistent.

## CV (`cv.html`)

- Add your real CV as `cv.pdf` in the repo root — the download button already
  points to it.
- Replace the placeholder paragraphs in each `.cv-block` with real content.

## Images

Put all images in `images/`. Reference them as `images/filename.jpg` from any
page (paths are relative to the repo root since all pages live there).
