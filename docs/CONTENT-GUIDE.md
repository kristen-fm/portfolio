# Content Guide

How to add or change content on the site. Page HTML is **generated** from
data files and content fragments under `src/` by `build.js` — you edit
`src/`, then run `node build.js` to regenerate the actual pages, and commit
both. See the "Build" section of the main [`README.md`](../README.md) for
the build command details.

**Never hand-edit the generated HTML files directly** (`index.html`,
`scholarship/index.html`, `cv/index.html`, etc., and any `<slug>/index.html`)
— the next build will overwrite your changes.

## Repo layout

```
build.js                              generates every page below from src/
src/
  data/
    nav.js                            nav links — the one place to add/rename a top-level page
    site.js                           site title, copyright year, fonts link
    scholarship.js                    scholarship entries (array)
    reflections.js                    reflection entries (array, same shape as scholarship.js)
    learning-design.js                learning-design portfolio items (array)
    cv.js                             CV summary + blocks (education, experience, links)
    home.js                           homepage hero/questions/about
  content/
    scholarship/<slug>.html           freeform post-body fragment for a scholarship detail page
    reflections/<slug>.html           freeform post-body fragment for a reflection detail page
    home/about.html                   About prose (and, in Phase II, Philosophy/Values/Goals)
  templates/                          render functions — rarely need editing for a content change
```

Paths in generated HTML are root-relative (they start with `/`), so they work
identically no matter how deep the page is.

## Colors, fonts, spacing

All design tokens live at the top of `assets/css/styles.css` under
`:root { ... }`. Change a color or font there and it updates across every
page. This file is not generated — edit it directly.

## Adding a new entry to an existing list

This is the common case: a new scholarship commentary, a new reflection, a
new learning-design portfolio item, a new CV role or publication. It's a
**data-only** change — no nav editing, no copying HTML.

### Scholarship or Reflections entry

Add an object to the array in `src/data/scholarship.js` or
`src/data/reflections.js`:

```js
{
  slug: "my-new-entry",                 // lowercase letters, digits, hyphens only — or null if it has no own page
  date: { display: "March 2026", datetime: "2026-03-01" },
  type: "Commentary",
  title: "My new entry title",
  summaryHtml: [
    `                Paragraph one, as raw HTML (links, <em>, HTML entities like
                &rsquo; and &mdash; are all fine here).`,
  ],
  referencesHtml: null,                 // or a raw HTML string with an APA citation
  link: { href: "https://example.com/wherever-this-lives", external: true, label: "Read it here" },
  detail: null,                         // or a detail block if it has its own page — see below
}
```

If the entry has no detail page, `link.href` is whatever you put there (an
external URL, typically). If it *does* have a detail page, `link.href` is
**ignored and overwritten at build time** with `/<section>/<slug>/` derived
from the entry's own `slug` — so the listing card and the detail page can
never point at different URLs. `build.js` also rejects an entry that sets
both `detail` and `link.external: true`, since a detail page always implies
an internal link.

If it needs its own detail page, add a `detail` block and a content fragment:

1. Create `src/content/scholarship/my-new-entry.html` (or
   `src/content/reflections/...`) containing just the inner `.post-body`
   HTML — paragraphs, blockquotes, references, whatever the piece needs.
2. Add the `detail` block. Every token you list in `headerOrder` must have a
   non-null value for the field it renders (`meta` → `metaLine`, `h1` →
   `headingHtml`, `subtitle` → `subtitleHtml`, `provenance` →
   `provenanceHtml`) — `build.js` will fail loudly if one is missing rather
   than silently printing the word "null" on the page. A scholarship-style
   post typically uses `provenance` (where it was first published); a
   reflection-style post typically uses `subtitle` instead — don't include a
   token whose field you're leaving `null`:
   ```js
   detail: {
     documentTitle: "My New Entry | Kristen Foster-Marks",
     metaDescription: "One-sentence description for search/social previews",
     headingHtml: "My new entry title",       // the <h1> — can differ from the listing title
     subtitleHtml: null,                       // set this OR provenanceHtml, not both — see above
     provenanceHtml: "Originally published in ... Reproduced here by the author.",
     headerOrder: ["meta", "h1", "provenance"], // or ["meta","h1","subtitle"] / ["h1","subtitle","meta"] — match the order you want, and only list tokens whose field is non-null
     metaLine: `<time datetime="2026-03-01">March 1, 2026</time> &middot; Commentary`,
     backLabel: "Scholarship",                 // "Scholarship" or "Reflections"
     bodyFile: "content/scholarship/my-new-entry.html",
   }
   ```
3. Set `link.href` to anything (it'll be overwritten — see above) and run
   `node build.js`. The detail page's output path
   (`scholarship/my-new-entry/index.html`) is derived automatically from the
   `slug` — you don't register it anywhere else.

A `slug` must be lowercase letters, digits, and hyphens only (`build.js`
rejects anything else). This isn't just style: a slug becomes both a
directory name and a URL path segment, so a character like `#` or `?` would
build successfully as a literal directory but be interpreted by a browser as
a URL fragment or query string, silently pointing the link at the wrong
place.

Removing or renaming an entry's `slug` will cause `node build.js` to delete
its old generated page on the next run (tracked via `.build-manifest.json`).
If you're renaming a URL that may already be linked elsewhere, consider
keeping the old slug as a stub that links to the new one, since there's no
automatic redirect.

### Learning Design portfolio item

Add an object to the array in `src/data/learning-design.js`:

```js
{
  id: "my-project",           // becomes the article's id="" for deep-linking
  metaLine: "Workshop &middot; 2026",
  title: "My project title",
  summaryHtml: [ `              One or two summary paragraphs, raw HTML.` ],
  link: { href: "https://...", external: true, label: "View the project" },
  grid: null,                  // or the 6-part breakdown below
}
```

For the full case-study breakdown, set `grid` to an array of six
`{ heading, bodyHtml }` parts, in this order: Problem, Learners / Context,
Evidence / Theory, Design Decisions, Artifact, Outcomes / Reflection. Each
renders as a `.portfolio-item-part` inside a `.portfolio-item-grid`.

### CV entry

Edit `src/data/cv.js`. Each block in `blocks` has a `kind`:

- `"roles"` (Education, Professional Experience): append to `roles`, each
  `{ title | titleHtml, dates, sub, bullets }`.
- `"linklist"` (Selected Learning Experiences, Conferences/Podcasts/Webinars):
  append to `links`, each either `{ label, href }` or, for anything with
  surrounding prose, multiple links, or italics, `{ html: "<a href=...>...</a> — ..." }`.
- `"listgroups"` (Research, Writing & Interviews): append to the relevant
  group's `links` array, or add a new `{ heading, links }` group.

## Adding a genuinely new top-level page

This is different from adding an entry — it's a new page *type* with its own
layout, not another item in an existing list. It's the one case that still
touches the build script directly:

1. Add the nav entry to `src/data/nav.js` — this alone updates the nav on
   every page.
2. Create `src/data/<page>.js` for its data and
   `src/templates/pages/<page>.js` for its render function (look at
   `src/templates/pages/home.js` for the simplest example).
3. Register the new page's output path in `build.js` (next to the other
   fixed top-level pages).
4. Run `node build.js`.

## Freeform narrative content

The About/Philosophy prose on the homepage and every detail page's body live
as plain `.html` fragment files under `src/content/`, referenced by path from
the relevant data record (`aboutFile`, `detail.bodyFile`). Write these as
you would any HTML — full paragraphs, blockquotes, `<h2>` subheadings,
references — there's no templating syntax inside them.

## Escaping

Fields ending in `Html` (`summaryHtml`, `headingHtml`, `bodyHtml`, etc.) are
inserted into the page verbatim — write real HTML there, including entities
like `&rsquo;`/`&mdash;`. **Never** run these through `escapeAttr` (see
below) — they already contain intentional markup/entities, and escaping them
would double-encode (`&mdash;` &rarr; `&amp;mdash;`).

A small number of genuinely plain-text fields — `metaDescription` (the
`<meta name="description">` value, via `src/templates/layout.js`) and the
hero image `alt` text (`src/templates/pages/home.js`) — are passed through
`escapeAttr()` (`src/templates/util.js`) before being inserted, so a stray
`"` or `&` you type in plain English there can't break the surrounding
attribute. Write those fields as plain text, not HTML.

Every other plain field without an `Html` suffix (`title`, `dates`, `label`,
`documentTitle`, etc.) is still inserted as-is with no auto-escaping — many
of these already contain hand-typed entities (e.g. CV dates use `&ndash;`,
some `documentTitle`s use `&amp;`), so escaping them centrally would require
migrating that existing content first. If you add a literal `&` to one of
these fields, write it as `&amp;` yourself.

## Images

Put all images in `assets/images/`. Reference them from any page as
`/assets/images/filename` (root-relative, so the same path works everywhere).
This is unrelated to the build — image files aren't generated.
