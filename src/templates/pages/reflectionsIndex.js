const { renderPage } = require("../layout");
const { renderEntryCard } = require("../components/entryCard");

function renderReflectionsIndex(entries) {
  const entriesHtml = entries.map(renderEntryCard).join("\n\n");

  const bodyHtml = `      <section class="prose-section" id="section-intro">
        <div class="wrap">
          <p class="eyebrow">Reflections</p>
          <h1>Reflections</h1>
        </div>
      </section>

      <section id="entries">
        <div class="wrap">
          <div class="entry-list">
            <!-- One .entry per reflection. Use <time> for the date and keep tags subtle. -->
${entriesHtml}
          </div>
        </div>
      </section>`;

  return renderPage({
    documentTitle: "Reflections | Kristen Foster-Marks",
    description: "Reflections - Kristen Foster-Marks portfolio",
    activeNavHref: "/reflections/",
    bodyHtml,
  });
}

module.exports = { renderReflectionsIndex };
