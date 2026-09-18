function renderRole(role) {
  const heading = role.titleHtml || role.title;
  const subLine = role.sub ? `\n              <p class="cv-role-sub">${role.sub}</p>` : "";
  const bulletsBlock = role.bullets.length
    ? `\n              <ul>\n${role.bullets.map((b) => `                <li>${b}</li>`).join("\n")}\n              </ul>`
    : "";

  return `            <div class="cv-role">
              <div class="cv-role-header">
                <h3>${heading}</h3>
                <p class="cv-role-dates">${role.dates}</p>
              </div>${subLine}${bulletsBlock}
            </div>`;
}

function renderCvRolesBlock(block) {
  const roles = block.roles.map(renderRole).join("\n\n");
  return `          <div class="cv-block">
            <h2>${block.heading}</h2>

${roles}
          </div>`;
}

function renderLinkItem(link) {
  if (link.html) return `              <li>${link.html}</li>`;
  return `              <li><a href="${link.href}">${link.label}</a></li>`;
}

function renderCvLinkListBlock(block) {
  const items = block.links.map(renderLinkItem).join("\n");
  return `          <div class="cv-block">
            <h2>${block.heading}</h2>
            <ul>
${items}
            </ul>
          </div>`;
}

function renderGroup(group) {
  const items = group.links.map((l) => `                <li>${l.html}</li>`).join("\n");
  return `            <div class="cv-list-group">
              <h3>${group.heading}</h3>
              <ul>
${items}
              </ul>
            </div>`;
}

function renderCvListGroupsBlock(block) {
  const groups = block.groups.map(renderGroup).join("\n\n");
  return `          <div class="cv-block">
            <h2>${block.heading}</h2>

${groups}
          </div>`;
}

const RENDERERS = {
  roles: renderCvRolesBlock,
  linklist: renderCvLinkListBlock,
  listgroups: renderCvListGroupsBlock,
};

function renderCvBlock(block) {
  const renderer = RENDERERS[block.kind];
  if (!renderer) throw new Error(`Unknown CV block kind: ${block.kind}`);
  return renderer(block);
}

module.exports = { renderCvBlock };
