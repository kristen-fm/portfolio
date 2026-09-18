const { renderPage } = require("../layout");
const { escapeAttr } = require("../util");

// The Philosophy, Values, and Goals section is a Phase II requirement.
// Kept as a literal HTML comment (as in the original hand-written page)
// so it stays visible to the author until it's ready to be filled in.
const PHILOSOPHY_PLACEHOLDER = `      <!-- ============ PHILOSOPHY, VALUES, AND GOALS ============ -->
      <!--
      <section class="prose-section" id="philosophy">
        <div class="wrap">
          <div class="section-heading">
            <h2>Philosophy, Values, and Goals</h2>
          </div>
          <p>
            Statement of who you are and your philosophy, values, and goals as they
            relate to this portfolio's audience and focus (Phase II requirement).
            Placeholder for a statement of your teaching/learning-design philosophy,
            core values, and goals as they relate to the audience and purpose stated
            above.
          </p>
        </div>
      </section>
      -->`;

function renderQuestion(question) {
  return `            <article class="question">
              <span class="question-number">${question.number}</span>
              <h3>${question.titleHtml}</h3>
              <p class="question-tags">${question.tagsHtml}</p>
            </article>`;
}

function renderHomePage(home, aboutHtml) {
  const ctasHtml = home.hero.ctas
    .map((cta) => `              <a class="cta-link" href="${cta.href}">${cta.label}</a>`)
    .join("\n");

  const questionsHtml = home.questions.map(renderQuestion).join("\n");

  const bodyHtml = `      <!-- ============ HERO ============ -->
      <section class="hero">
        <div class="wrap hero-grid">
          <div class="hero-text">
            <h1>${home.hero.headlineHtml}</h1>
            <p class="subhead">
              ${home.hero.subheadHtml}
            </p>
            <div class="cta-row">
${ctasHtml}
            </div>
          </div>

          <div class="hero-visual" aria-hidden="false">
            <img
              class="collage-photo"
              src="${home.hero.photo.src}"
              alt="${escapeAttr(home.hero.photo.alt)}"
            >
            <img
              class="collage-strip"
              src="${home.hero.strip.src}"
              alt="${escapeAttr(home.hero.strip.alt)}"
            >
          </div>
        </div>
      </section>

      <!-- ============ QUESTIONS ============ -->
      <section class="questions">
        <div class="wrap">
          <div class="section-heading">
            <h2>Questions I keep returning to</h2>
          </div>
          <div class="questions-grid">
${questionsHtml}
          </div>
        </div>
      </section>


      <!-- ============ ABOUT ============ -->
      <section class="prose-section" id="about">
        <div class="wrap">
          <div class="section-heading">
            <h2>About</h2>
          </div>
          <p>
${aboutHtml}
          </p>
        </div>
      </section>

${PHILOSOPHY_PLACEHOLDER}`;

  return renderPage({
    documentTitle: home.documentTitle,
    description: home.metaDescription,
    activeNavHref: home.activeNavHref,
    bodyHtml,
  });
}

module.exports = { renderHomePage };
