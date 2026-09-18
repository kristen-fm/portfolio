const { renderPage } = require("../layout");

const SECTION_BACK_LABEL = {
  scholarship: { href: "/scholarship/", label: "Scholarship" },
  reflections: { href: "/reflections/", label: "Reflections" },
};

// Maps a headerOrder token to the detail field it renders. Every token in a
// post's headerOrder must have a non-null value for that field — a null here
// would otherwise render as the literal text "null" on the page.
const HEADER_TOKEN_FIELDS = {
  meta: "metaLine",
  h1: "headingHtml",
  subtitle: "subtitleHtml",
  provenance: "provenanceHtml",
};

function renderHeaderPart(token, detail) {
  const field = HEADER_TOKEN_FIELDS[token];
  if (!field) {
    throw new Error(`Unknown post header token: ${token}`);
  }
  if (detail[field] == null) {
    throw new Error(
      `headerOrder includes "${token}" but detail.${field} is null/undefined`
    );
  }

  if (token === "meta") {
    return `            <p class="entry-meta">
              ${detail.metaLine}
            </p>`;
  }
  if (token === "h1") {
    return `            <h1>${detail.headingHtml}</h1>`;
  }
  if (token === "subtitle") {
    return `            <p class="post-subtitle">${detail.subtitleHtml}</p>`;
  }
  return `            <p class="post-provenance">
              ${detail.provenanceHtml}
            </p>`;
}

function renderPostPage({ section, entry }, bodyHtml) {
  const back = SECTION_BACK_LABEL[section];
  const headerHtml = entry.detail.headerOrder
    .map((token) => renderHeaderPart(token, entry.detail))
    .join("\n");

  const bodyWrapped = `      <article class="post">
        <div class="wrap">
          <a class="back-link" href="${back.href}">&larr; Back to ${back.label}</a>

          <header class="post-header">
${headerHtml}
          </header>

          <div class="post-body">
${bodyHtml}
          </div>
        </div>
      </article>`;

  return renderPage({
    documentTitle: entry.detail.documentTitle,
    description: entry.detail.metaDescription,
    activeNavHref: back.href,
    bodyHtml: bodyWrapped,
  });
}

module.exports = { renderPostPage };
