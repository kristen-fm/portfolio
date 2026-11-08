const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// `datetime` is the entry's ISO date (YYYY-MM-DD), the same value used in its
// <time datetime="..."> element, so the abbreviation always matches what's
// shown on the entry itself.
function monthYearAbbrev(datetime) {
  if (!datetime) return null;
  const [year, month] = datetime.split("-");
  const index = Number(month) - 1;
  if (!year || Number.isNaN(index) || index < 0 || index > 11) return null;
  return `${MONTHS[index]} ${year}`;
}

function renderTocRow(item) {
  const abbrev = monthYearAbbrev(item.dateIso);
  const dateHtml = abbrev ? `<span class="toc-date">${abbrev}</span>` : "";

  return `              <li class="toc-item">
                <a class="toc-link" href="#${item.id}">
                  ${dateHtml}<span class="toc-title">${item.title}</span>
                </a>
              </li>`;
}

// Splits entries into two reading-order columns: top-to-bottom in the first
// column, then top-to-bottom in the second, with the first column getting
// the extra entry when the total is odd.
function splitColumns(items) {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

function renderTocColumn(items) {
  return `            <ol class="toc-list" role="list">
${items.map(renderTocRow).join("\n")}
            </ol>`;
}

// `items` is an array of { id, title, dateIso } already derived from a
// page's entries. Returns "" (render nothing) when there are fewer than two
// entries, per the "no ToC for 0-1 entries" rule.
function renderToc(items) {
  if (items.length < 2) return "";

  const [first, second] = splitColumns(items);

  return `      <nav class="toc" id="toc" aria-label="Table of contents">
        <div class="wrap">
          <div class="toc-heading">
            <span class="toc-heading-label">Table of Contents</span>
            <span class="toc-heading-rule" aria-hidden="true"></span>
          </div>
          <div class="toc-columns">
${renderTocColumn(first)}
${renderTocColumn(second)}
          </div>
        </div>
      </nav>`;
}

// A bare "#" (rather than "#toc") is a fragment link to the top of the
// document per the HTML spec, which is simpler than scrolling to the toc
// nav itself and matches the "back to the top" request.
function renderBackToToc() {
  return `<a class="entry-link back-to-toc" href="#">&uarr; Back to contents</a>`;
}

module.exports = { renderToc, renderBackToToc };
