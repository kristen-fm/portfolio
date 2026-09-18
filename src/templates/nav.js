const nav = require("../data/nav");

function renderHeader(activeNavHref) {
  const links = nav
    .map((item) => {
      const current = item.href === activeNavHref ? ' aria-current="page"' : "";
      return `          <a href="${item.href}"${current}>${item.label}</a>`;
    })
    .join("\n");

  return `    <header class="site-header">
      <div class="wrap">
        <a class="site-title" href="/">KRISTEN FOSTER-MARKS</a>
        <nav class="primary-nav" aria-label="Primary">
${links}
        </nav>
      </div>
    </header>`;
}

module.exports = { renderHeader };
