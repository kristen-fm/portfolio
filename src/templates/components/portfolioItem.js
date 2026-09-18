function renderGridPart(part) {
  return `              <div class="portfolio-item-part">
                <h4>${part.heading}</h4>
                <p>${part.bodyHtml}</p>
              </div>`;
}

function renderPortfolioItem(item) {
  const paragraphs = item.summaryHtml
    .map((p) => `            <p>\n${p}\n            </p>`)
    .join("\n");

  const gridBlock = item.grid
    ? `\n            <div class="portfolio-item-grid">\n${item.grid
        .map(renderGridPart)
        .join("\n")}\n            </div>`
    : "";

  const linkAttrs = item.link.external ? ` target="_blank" rel="noopener noreferrer"` : "";

  return `          <article class="portfolio-item" id="${item.id}">
            <p class="entry-meta">${item.metaLine}</p>
            <h3>${item.title}</h3>
${paragraphs}${gridBlock}
            <a class="entry-link" href="${item.link.href}"${linkAttrs}>${item.link.label} &rarr;</a>
          </article>`;
}

module.exports = { renderPortfolioItem };
