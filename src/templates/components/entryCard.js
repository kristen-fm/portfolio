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

function renderEntryCard(entry) {
  const paragraphs = entry.summaryHtml
    .map((p) => `              <p>\n${p}\n              </p>`)
    .join("\n");

  const referencesBlock = entry.referencesHtml
    ? `\n              <div class="references">\n${entry.referencesHtml}\n              </div>`
    : "";

  const linkAttrs = entry.link.external
    ? ` target="_blank" rel="noopener noreferrer"`
    : "";

  return `            <article class="entry"${entry.id ? ` id="${entry.id}"` : ""}>
${renderMetaBlock(entry)}
              <h3>${entry.title}</h3>
${paragraphs}${referencesBlock}
              <a class="entry-link" href="${entry.link.href}"${linkAttrs}>${entry.link.label} &rarr;</a>
            </article>`;
}

module.exports = { renderEntryCard };
