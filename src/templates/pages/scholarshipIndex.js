const { renderPage } = require("../layout");
const { renderEntryCard } = require("../components/entryCard");

const PLACEHOLDER_ENTRY_COMMENT = `            <!--
              One .entry per paper / project / presentation. Each item should read
              as a serious academic artifact: what it is, why it's included, and its
              connection to theory/research (praxis). Add APA-style references where
              relevant.

            <article class="entry">
              <p class="entry-meta">Paper &middot; 2026</p>
              <h3>Placeholder title: a study of [topic]</h3>
              <p>
                Placeholder narrative covering what this item is, why it is included
                in this portfolio (fit to audience/purpose), and how it connects to
                theory or research.
              </p>
              <a class="entry-link" href="#">Read more &rarr;</a>
            </article>

            <article class="entry">
              <p class="entry-meta">Presentation &middot; 2026</p>
              <h3>Placeholder title: presentation on [topic]</h3>
              <p>
                Placeholder narrative covering what this item is, why it is included,
                and its connection to theory/research.
              </p>
              <a class="entry-link" href="#">Read more &rarr;</a>
            </article>
            -->`;

function renderScholarshipIndex(entries) {
  const entriesHtml = entries.map(renderEntryCard).join("\n\n");

  const bodyHtml = `      <section class="prose-section" id="section-intro">
        <div class="wrap">
          <p class="eyebrow">Research &amp; Scholarship</p>
          <h1>Research &amp; Scholarship</h1>
          <p>
            My research interests center on adult learning, particularly motivation and participation, self-directed learning, learner beliefs, and learning in workplace contexts. I draw primarily on the adult education and learning sciences literatures, including work on educational participation, metacognition, self-regulated and self-directed learning, and sociocultural perspectives on learning. I am especially interested in how these bodies of research can inform the design of learning environments that support sustained engagement, autonomy, and meaningful learning.
          </p>
        </div>
      </section>

      <section id="items">
        <div class="wrap">
          <div class="entry-list">
${entriesHtml}
${PLACEHOLDER_ENTRY_COMMENT}
          </div>
        </div>
      </section>
`;

  return renderPage({
    documentTitle: "Research &amp; Scholarship | Kristen Foster-Marks",
    description: "Research and scholarship - Kristen Foster-Marks portfolio",
    activeNavHref: "/scholarship/",
    bodyHtml,
  });
}

module.exports = { renderScholarshipIndex };
