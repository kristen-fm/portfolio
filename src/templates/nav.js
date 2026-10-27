const nav = require("../data/nav");
const site = require("../data/site");

function renderHeader(activeNavHref) {
  const links = nav
    .map((item) => {
      const current = item.href === activeNavHref ? ' aria-current="page"' : "";
      return `          <a href="${item.href}"${current}>${item.label}</a>`;
    })
    .join("\n");

  const linkedin = `          <a class="nav-linkedin" href="${site.linkedinUrl}" target="_blank" rel="noopener" aria-label="LinkedIn profile (opens in a new tab)"><img src="/assets/images/linkedin.svg" alt="" width="18" height="18"></a>`;

  return `    <header class="site-header">
      <div class="wrap">
        <a class="site-title" href="/">KRISTEN FOSTER-MARKS</a>
        <nav class="primary-nav" aria-label="Primary">
${links}
${linkedin}
        </nav>
      </div>
    </header>`;
}

module.exports = { renderHeader };
