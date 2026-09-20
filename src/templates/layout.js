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
    <script>
      (function(h,o,u,n,d) {
        h=h[d]=h[d]||{q:[],onReady:function(c){h.q.push(c)}}
        d=o.createElement(u);d.async=1;d.src=n
        n=o.getElementsByTagName(u)[0];n.parentNode.insertBefore(d,n)
      })(window,document,'script','https://www.datadoghq-browser-agent.com/us1/v5/datadog-rum.js','DD_RUM')
      window.DD_RUM.onReady(function() {
        window.DD_RUM.init({
          applicationId: '95d6d82f-72cd-4286-990b-6b813cd1ccdc',
          clientToken: 'pub0e825c957cc4a3468f91bfbd14f0d66d',
          site: 'datadoghq.com',
          service: 'portfolio',
          env: 'production',
          sessionSampleRate: 100,
          sessionReplaySampleRate: 0,
          trackResources: true,
          trackUserInteractions: true,
          trackLongTasks: true,
          defaultPrivacyLevel: 'mask-user-input',
        })
      })
    </script>
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
