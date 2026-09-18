const site = require("../data/site");
const { renderHeader } = require("./nav");
const { escapeAttr } = require("./util");

function renderPage({ documentTitle, description, activeNavHref, bodyHtml }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeAttr(description)}">
    <title>${documentTitle}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="${site.fontsLink}" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/styles.css">
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>

    <img class="contour-corner contour-corner--top" src="/assets/images/contour.png" alt="" aria-hidden="true">
    <img class="contour-corner contour-corner--bottom" src="/assets/images/contour.png" alt="" aria-hidden="true">

${renderHeader(activeNavHref)}

    <main id="main">
${bodyHtml}
    </main>

    <footer class="site-footer">
      <div class="wrap">
        <p>&copy; ${site.copyrightYear} Kristen Foster-Marks</p>
      </div>
    </footer>

    <script src="/assets/js/script.js"></script>
  </body>
</html>
`;
}

module.exports = { renderPage };
