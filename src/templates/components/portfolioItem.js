const { renderBackToToc } = require("./toc");
const { referencesLabel } = require("./references");

function renderGridPart(part) {
  return `              <div class="portfolio-item-part">
                <h4>${part.heading}</h4>
                <p>${part.bodyHtml}</p>
              </div>`;
}

function renderPortfolioItem(item, { showBackToToc = false } = {}) {
  const paragraphs = item.summaryHtml
    .map((p) => `            <p>\n${p}\n            </p>`)
    .join("\n");

  const gridBlock = item.grid
    ? `\n            <div class="portfolio-item-grid">\n${item.grid
        .map(renderGridPart)
        .join("\n")}\n            </div>`
    : "";

  const referencesBlock = item.referencesHtml
    ? `\n            <div class="references">\n              <h4 class="references-heading">${referencesLabel(item.referencesHtml)}</h4>\n${item.referencesHtml}\n            </div>`
    : "";

  const linkAttrs = item.link.external ? ` target="_blank" rel="noopener noreferrer"` : "";
  const entryLink = `<a class="entry-link" href="${item.link.href}"${linkAttrs}>${item.link.label} &rarr;</a>`;
  const actionsHtml = showBackToToc
    ? `            <div class="entry-actions">\n              ${entryLink}\n              ${renderBackToToc()}\n            </div>`
    : `            ${entryLink}`;

  return `          <article class="portfolio-item" id="${item.id}">
            <p class="entry-meta">${item.metaLine}</p>
            <h3>${item.title}</h3>
${paragraphs}${gridBlock}${referencesBlock}
${actionsHtml}
          </article>`;
}

module.exports = { renderPortfolioItem };
