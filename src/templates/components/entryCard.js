const { renderBackToToc } = require("./toc");
const { referencesLabel } = require("./references");

function renderMetaBlock(entry) {
  // A plain `dateText` (e.g. "Preprint &middot; October 2024") renders as a
  // single line; a structured `date`+`type` pair renders wrapped across
  // three lines with a <time> element, matching the two distinct patterns
  // present in the original hand-written markup.
  if (entry.dateText) {
    return `              <p class="entry-meta">${entry.dateText}</p>`;
  }
  return `              <p class="entry-meta">
                <time datetime="${entry.date.datetime}">${entry.date.display}</time> &middot; ${entry.type}
              </p>`;
}

function renderEntryCard(entry, { boxed = false, showBackToToc = false } = {}) {
  const paragraphs = entry.summaryHtml
    .map((p) => `              <p>\n${p}\n              </p>`)
    .join("\n");

  const referencesBlock = entry.referencesHtml
    ? `\n              <div class="references">\n                <h4 class="references-heading">${referencesLabel(entry.referencesHtml)}</h4>\n${entry.referencesHtml}\n              </div>`
    : "";

  const linkAttrs = entry.link.external
    ? ` target="_blank" rel="noopener noreferrer"`
    : "";

  const className = boxed ? "entry entry--boxed" : "entry";
  const entryLink = `<a class="entry-link" href="${entry.link.href}"${linkAttrs}>${entry.link.label} &rarr;</a>`;
  const actionsHtml = showBackToToc
    ? `              <div class="entry-actions">\n                ${entryLink}\n                ${renderBackToToc()}\n              </div>`
    : `              ${entryLink}`;

  return `            <article class="${className}"${entry.id ? ` id="${entry.id}"` : ""}>
${renderMetaBlock(entry)}
              <h3>${entry.title}</h3>
${paragraphs}${referencesBlock}
${actionsHtml}
            </article>`;
}

module.exports = { renderEntryCard };
