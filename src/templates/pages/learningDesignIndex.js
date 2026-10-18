const { renderPage } = require("../layout");
const { renderPortfolioItem } = require("../components/portfolioItem");

const PLACEHOLDER_ITEM_COMMENT = `          <!--
            PORTFOLIO ITEM TEMPLATE
            Copy this .portfolio-item block for each project. Each one should walk
            through: Problem, Learners/Context, Evidence/Theory, Design Decisions,
            Artifact, Outcomes/Reflection.

          <article class="portfolio-item">
            <p class="entry-meta">Portfolio Item &middot; 2026</p>
            <h3>Placeholder project title</h3>
            <p>
              One or two sentences summarizing the project before the detailed
              breakdown below.
            </p>
            <div class="portfolio-item-grid">
              <div class="portfolio-item-part">
                <h4>Problem</h4>
                <p>Placeholder: what problem or need prompted this work.</p>
              </div>
              <div class="portfolio-item-part">
                <h4>Learners / Context</h4>
                <p>Placeholder: who the learners were and the setting.</p>
              </div>
              <div class="portfolio-item-part">
                <h4>Evidence / Theory</h4>
                <p>Placeholder: the theory or evidence base informing the design.</p>
              </div>
              <div class="portfolio-item-part">
                <h4>Design Decisions</h4>
                <p>Placeholder: key decisions made and why.</p>
              </div>
              <div class="portfolio-item-part">
                <h4>Artifact</h4>
                <p>Placeholder: link to or description of the resulting artifact.</p>
              </div>
              <div class="portfolio-item-part">
                <h4>Outcomes / Reflection</h4>
                <p>Placeholder: what happened, and what you'd do differently.</p>
              </div>
            </div>
          </article>
          -->`;

function renderLearningDesignIndex(items) {
  const itemsHtml = items.map(renderPortfolioItem).join("\n\n");

  const bodyHtml = `      <section class="prose-section" id="section-intro">
        <div class="wrap">
          <p class="eyebrow">Learning Design &amp; Practice</p>
          <h1>Learning Design &amp; Practice</h1>
            <p>
              My learning design work focuses on software practitioners in workplace learning environments. I draw primarily on the adult education, behavioral psychology, and learning sciences literatures, including work on motivation, engagement, self-regulated and self-directed learning, and sociocultural perspectives on learning.
            </p>
        </div>
      </section>

      <section id="items">
        <div class="wrap">

${itemsHtml}

${PLACEHOLDER_ITEM_COMMENT}
        </div>
      </section>
`;

  return renderPage({
    documentTitle: "Learning Design &amp; Practice | Kristen Foster-Marks",
    description: "Learning design and practice - Kristen Foster-Marks portfolio",
    activeNavHref: "/learning-design/",
    bodyHtml,
  });
}

module.exports = { renderLearningDesignIndex };
