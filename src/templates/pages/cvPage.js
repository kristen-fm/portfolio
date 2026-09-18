const { renderPage } = require("../layout");
const { renderCvBlock } = require("../components/cvRole");

function renderCvPage(cv) {
  const summaryBlock = `          <div class="cv-block">
            <h2>Summary</h2>
            <p>
${cv.summaryHtml}
            </p>
          </div>`;

  const blocksHtml = cv.blocks.map(renderCvBlock).join("\n\n");

  const bodyHtml = `      <section id="cv">
        <div class="wrap">
          <p class="eyebrow">Curriculum Vitae</p>
          <h1>${cv.name}</h1>
          <p class="cv-contact">${cv.location} &middot; ${cv.email}</p>

          <a class="cv-download" href="${cv.pdfHref}" download>Download CV (PDF) &darr;</a>

${summaryBlock}

${blocksHtml}
        </div>
      </section>`;

  return renderPage({
    documentTitle: "CV | Kristen Foster-Marks",
    description: "CV - Kristen Foster-Marks portfolio",
    activeNavHref: "/cv/",
    bodyHtml,
  });
}

module.exports = { renderCvPage };
