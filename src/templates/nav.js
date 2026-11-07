const nav = require("../data/nav");
const site = require("../data/site");
const { icons, arrow, menuToggle } = require("./navIcons");

function renderHeader(activeNavHref) {
  const links = nav
    .map((item) => {
      const current = item.href === activeNavHref ? ' aria-current="page"' : "";
      const icon = icons[item.icon];
      if (!icon) throw new Error(`nav.js: unknown icon "${item.icon}" for "${item.label}"`);
      return `          <a href="${item.href}"${current}>${icon}<span class="nav-label">${item.label}</span>${arrow}</a>`;
    })
    .join("\n");

  const linkedinAttrs = `href="${site.linkedinUrl}" target="_blank" rel="noopener" aria-label="LinkedIn profile (opens in a new tab)"`;
  const linkedinImg = `<img src="/assets/images/linkedin.svg" alt="" width="18" height="18">`;

  // Two LinkedIn links on purpose: the one inside the nav is for desktop; the
  // one in the header bar stays visible on mobile while the menu is collapsed.
  // CSS shows exactly one at a time (display:none also removes it from the
  // accessibility tree and tab order).
  return `    <header class="site-header">
      <div class="wrap">
        <a class="site-title" href="/">KRISTEN FOSTER-MARKS</a>
        <a class="header-linkedin" ${linkedinAttrs}>${linkedinImg}</a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="Menu">${menuToggle}</button>
        <nav class="primary-nav" id="primary-nav" aria-label="Primary">
${links}
          <a class="nav-linkedin" ${linkedinAttrs}>${linkedinImg}</a>
        </nav>
      </div>
    </header>`;
}

module.exports = { renderHeader };
