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

function renderCommitments(commitments, { compact = false } = {}) {
  const items = commitments
    .map((c) => {
      const detail = !compact && c.detailHtml ? ` <span class="pdp-commitment-detail">${c.detailHtml}</span>` : "";
      return `<li class="pdp-commitment pdp-commitment--${c.kind}"><span class="pdp-commitment-label">${c.label}</span>${detail}</li>`;
    })
    .join("");
  return `<ul class="pdp-commitments${compact ? " pdp-commitments--compact" : ""}" role="list">${items}</ul>`;
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
              <p class="pdp-goal-purpose">${goal.purposeHtml}</p>
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

function renderOverview(settings, pdp) {
  const goalsHtml = pdp.goals
    .map((goal) => {
      const objectives = goal.objectives
        .map(
          (o) => `                  <li>
                    <a class="pdp-overview-obj" href="#${o.anchor}"><span class="pdp-overview-obj-id">${o.id}</span> <span class="pdp-overview-obj-title">${o.titleHtml}</span></a>
                    ${renderCommitments(o.commitments, { compact: true })}
                  </li>`
        )
        .join("\n");
      return `            <li class="pdp-overview-goal">
              <span class="pdp-overview-num" aria-hidden="true">${pad2(goal.number)}</span>
              <div class="pdp-overview-body">
                <h3><a href="#${goal.anchor}"><span class="visually-hidden">Goal ${goal.number}: </span>${goal.titleHtml}</a></h3>
                <ol class="pdp-overview-objectives" role="list">
${objectives}
                </ol>
              </div>
            </li>`;
    })
    .join("\n");

  const legendHtml = settings.legend
    .map(
      (l) => `              <div class="pdp-legend-item">
                <dt><span class="pdp-commitment pdp-commitment--${l.kind}"><span class="pdp-commitment-label">${l.label}</span></span></dt>
                <dd>${l.descriptionHtml}</dd>
              </div>`
    )
    .join("\n");

  return `      <section class="pdp-overview" aria-labelledby="pdp-overview-heading">
        <div class="wrap">
          <div class="section-heading">
            <h2 id="pdp-overview-heading">The plan at a glance</h2>
            <p class="pdp-tally">${plural(pdp.goals.length, "goal")} &middot; ${plural(pdp.objectiveCount, "objective")}</p>
          </div>

          <dl class="pdp-legend" aria-label="Commitment types">
${legendHtml}
          </dl>

          <ol class="pdp-overview-list" role="list">
${goalsHtml}
          </ol>
        </div>
      </section>`;
}

function renderGoalNav(goals) {
  const links = goals
    .map(
      (g) =>
        `              <li><a href="#${g.anchor}"><span class="pdp-goalnav-num" aria-hidden="true">${g.number}</span><span class="visually-hidden">Goal ${g.number}: </span>${g.navLabel}</a></li>`
    )
    .join("\n");
  return `        <nav class="pdp-goalnav" aria-label="Plan goals">
          <div class="wrap">
            <ol role="list">
${links}
            </ol>
          </div>
        </nav>`;
}

// ---------------------------------------------------------------- page

function renderPdpPage(settings, pdp) {
  const titles = goalTitleById(pdp.goals);
  const metaLine = settings.metaLineHtml ? `\n          <p class="pdp-meta">${settings.metaLineHtml}</p>` : "";

  const bodyHtml = `    <div class="pdp">
      <section class="pdp-header">
        <div class="wrap">
          <p class="eyebrow">${settings.eyebrow}</p>
          <h1>${settings.title}</h1>
          <p class="pdp-subtitle">${settings.subtitleHtml}</p>${metaLine}
        </div>
      </section>

      <section class="pdp-intro" aria-labelledby="pdp-intro-heading">
        <div class="wrap">
          <div class="pdp-measure">
            <h2 id="pdp-intro-heading">${pdp.introduction.headingHtml}</h2>
${pdp.introduction.bodyHtml}
          </div>
        </div>
      </section>

${renderOverview(settings, pdp)}

      <div class="pdp-plan">
${renderGoalNav(pdp.goals)}

        <div class="wrap pdp-toolbar" data-pdp-toolbar hidden>
          <button type="button" class="pdp-toggle-all" data-pdp-expand>Expand all</button>
          <button type="button" class="pdp-toggle-all" data-pdp-collapse>Collapse all</button>
        </div>

${pdp.goals.map((g) => renderGoalSection(g, titles)).join("\n\n")}
      </div>
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
