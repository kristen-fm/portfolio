const { renderPage } = require("../layout");
const { COLUMNS } = require("../../lib/pdp");

// Unlisted page: not in nav.js or linked from anywhere, and marked noindex.
// Reachable only by visiting /pdp/ directly. NOT access-controlled — anything
// here is public to anyone with the URL (and in the public repo).
//
// Every objective is rendered once, as a semantic <table>. On narrow screens
// CSS restyles the same markup into stacked, labelled blocks, so desktop and
// mobile share a single source (the Markdown files) and a single DOM.

function pad2(n) {
  return String(n).padStart(2, "0");
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function goalTitleById(goals) {
  return Object.fromEntries(goals.map((g) => [g.number, g.titleHtml]));
}

// ---------------------------------------------------------------- pieces

function renderCommitments(commitments) {
  const items = commitments
    .map((c) => {
      const detail = c.detailHtml ? ` <span class="pdp-commitment-detail">${c.detailHtml}</span>` : "";
      return `<li class="pdp-commitment pdp-commitment--${c.kind}"><span class="pdp-commitment-label">${c.label}</span>${detail}</li>`;
    })
    .join("");
  return `<ul class="pdp-commitments" role="list">${items}</ul>`;
}

function renderSupports(supports, titles) {
  const items = supports
    .map(
      (n) =>
        `<li><a href="#goal-${n}">G${n}<span class="visually-hidden">: Goal ${n}, ${titles[n]}</span></a></li>`
    )
    .join("");
  return `<ul class="pdp-supports" role="list">${items}</ul>`;
}

function renderCell(column, innerHtml) {
  return `                    <td role="cell" data-label="${column.label}">
                      <span class="pdp-cell-label" aria-hidden="true">${column.label}</span>
                      <div class="pdp-cell-value">${innerHtml}</div>
                    </td>`;
}

function renderObjectiveRow(obj, titles) {
  const col = Object.fromEntries(COLUMNS.map((c) => [c.key, c]));
  return `                  <tr role="row" id="${obj.anchor}">
                    <th role="rowheader" scope="row">
                      <a class="pdp-obj-id" href="#${obj.anchor}">${obj.id}</a>
                      <span class="pdp-obj-title">${obj.titleHtml}</span>
                    </th>
${renderCell(col.commitment, renderCommitments(obj.commitments))}
${renderCell(col.steps, obj.stepsHtml)}
${renderCell(col.resources, obj.resourcesHtml)}
${renderCell(col.timeline, obj.timelineHtml)}
${renderCell(col.measure, obj.measureHtml)}
${renderCell(col.supports, renderSupports(obj.supports, titles))}
                  </tr>`;
}

function renderGoalSection(goal, titles) {
  const headingId = `${goal.anchor}-heading`;
  const headerCells = COLUMNS.map(
    (c) => `                    <th role="columnheader" scope="col" class="pdp-col-${c.key}">${c.label}</th>`
  ).join("\n");
  const rows = goal.objectives.map((o) => renderObjectiveRow(o, titles)).join("\n");

  return `        <section class="pdp-goal" id="${goal.anchor}" aria-labelledby="${headingId}">
          <div class="wrap">
            <header class="pdp-goal-header">
              <p class="pdp-goal-number" aria-hidden="true">Goal ${pad2(goal.number)}</p>
              <h2 id="${headingId}"><span class="visually-hidden">Goal ${goal.number}: </span>${goal.titleHtml}</h2>
            </header>

            <details class="pdp-goal-details" open>
              <summary>
                <span class="pdp-summary-text">Objectives and planning details</span>
                <span class="pdp-summary-count">${plural(goal.objectives.length, "objective")}</span>
              </summary>
              <div class="pdp-table-wrap" role="region" aria-label="Goal ${goal.number} objectives" tabindex="0">
                <table class="pdp-table" role="table">
                  <caption class="visually-hidden">Objectives for Goal ${goal.number}: ${goal.titleHtml}</caption>
                  <thead role="rowgroup">
                    <tr role="row">
${headerCells}
                    </tr>
                  </thead>
                  <tbody role="rowgroup">
${rows}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        </section>`;
}

// ---------------------------------------------------------------- page

// APA reference list for the plan. Omitted entirely when src/data/pdp.js
// doesn't name a references file.
function renderReferences(references) {
  if (!references) return "";
  return `
      <section class="pdp-references" aria-labelledby="pdp-references-heading">
        <div class="wrap">
          <h2 id="pdp-references-heading">${references.headingHtml}</h2>
          <div class="references">
${references.bodyHtml}
          </div>
        </div>
      </section>`;
}


function renderPdpPage(settings, pdp) {
  const titles = goalTitleById(pdp.goals);

  const bodyHtml = `    <div class="pdp">
      <section class="pdp-header">
        <div class="wrap">
          <h1>${settings.title}</h1>
        </div>
      </section>

      <section class="pdp-intro" aria-labelledby="pdp-intro-heading">
        <div class="wrap">
          <h2 id="pdp-intro-heading">${pdp.introduction.headingHtml}</h2>
${pdp.introduction.bodyHtml}
        </div>
      </section>

      <div class="pdp-plan">
        <div class="wrap pdp-toolbar" data-pdp-toolbar hidden>
          <button type="button" class="pdp-toggle-all" data-pdp-expand>Expand all</button>
          <button type="button" class="pdp-toggle-all" data-pdp-collapse>Collapse all</button>
        </div>

${pdp.goals.map((g) => renderGoalSection(g, titles)).join("\n\n")}
      </div>
${renderReferences(pdp.references)}
    </div>`;

  return renderPage({
    documentTitle: settings.documentTitle,
    description: settings.metaDescription,
    activeNavHref: null,
    noindex: true,
    scripts: ["/assets/js/pdp.js"],
    bodyHtml,
  });
}

module.exports = { renderPdpPage };
