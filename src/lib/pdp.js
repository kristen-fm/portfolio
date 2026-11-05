// Loads and validates the Professional Development Plan Markdown files
// (src/content/pdp/*.md) into plain data for the page template.
//
// Parsing uses markdown-it's token stream (not regexes over raw Markdown):
// the table structure, bold objective IDs, and bold commitment labels are all
// read from tokens, and cell contents are rendered with markdown-it's own
// inline renderer, so links and emphasis work anywhere in a cell.
//
// Anything unexpected — a missing file, a renamed column, a malformed ID, an
// unknown commitment label, a reference to a goal that doesn't exist — throws
// an error naming the file and line, so the build fails loudly instead of
// silently dropping content.
const fs = require("fs");
const path = require("path");
const MarkdownIt = require("markdown-it");

// Raw HTML in the Markdown is disabled: the plan is plain prose, links, and
// emphasis, and this keeps the output predictable.
const md = new MarkdownIt({ html: false, linkify: false, typographer: false });

// Keep backslash-escaped characters as their own "text_special" tokens
// (normally merged into plain text) so an escaped "\;" can be told apart from
// a list-separating ";" — see splitListItems(). Render them as plain text.
md.core.ruler.disable("text_join");
md.renderer.rules.text_special = (tokens, idx) => md.utils.escapeHtml(tokens[idx].content);

// Column headers every goal table must have, in this order. `key` is the
// field name used by the template; `label` doubles as the visible column
// header and the stacked-layout field label on small screens.
const COLUMNS = [
  { key: "objective", header: "ID and Specific Objective", label: "Objective" },
  { key: "commitment", header: "Commitment", label: "Commitment" },
  { key: "steps", header: "Actionable Steps", label: "Actionable steps" },
  { key: "resources", header: "Resources", label: "Resources" },
  { key: "timeline", header: "Timeline", label: "Timeline" },
  { key: "measure", header: "Measure of Success", label: "Measure of success" },
  { key: "supports", header: "Also Supports", label: "Also supports" },
];

// Commitment labels allowed in the Commitment column (case-insensitive).
const COMMITMENT_KINDS = {
  core: { kind: "core", label: "Core" },
  stretch: { kind: "stretch", label: "Stretch" },
  "desired outcome": { kind: "outcome", label: "Desired outcome" },
};

const GOAL_HEADING_PATTERN = /^Goal (\d+) — (.+)$/;
const OBJECTIVE_ID_PATTERN = /^G(\d+)\.(\d+)$/;
const GOAL_REF_PATTERN = /^G(\d+)$/;

class PdpContentError extends Error {}

function fail(file, line, message) {
  const where = line ? `src/${file}:${line}` : `src/${file}`;
  throw new PdpContentError(`PDP content error in ${where}: ${message}`);
}

function lineOf(token) {
  return token && token.map ? token.map[0] + 1 : null;
}

function readMarkdown(srcRoot, relPath) {
  const fullPath = path.join(srcRoot, relPath);
  if (!fs.existsSync(fullPath)) {
    fail(relPath, null, "file not found (check the path in src/data/pdp.js)");
  }
  const source = fs.readFileSync(fullPath, "utf8");
  return { tokens: md.parse(source, {}), lines: source.split(/\r?\n/) };
}

// markdown-it follows the GFM spec and silently discards cells beyond the
// header's column count, so count the raw row's cells to catch that case
// (cells *missing* from a row are padded as empty and caught elsewhere).
function countRawCells(rawLine) {
  const cells = rawLine.trim().split(/(?<!\\)\|/);
  if (cells[0].trim() === "") cells.shift();
  if (cells.length && cells[cells.length - 1].trim() === "") cells.pop();
  return cells.length;
}

function renderInlineTokens(children) {
  return md.renderer.renderInline(children, md.options, {}).trim();
}

// Plain text of an inline token's children (used for labels and IDs).
function plainText(children) {
  return children
    .filter((t) => t.type === "text" || t.type === "text_special" || t.type === "code_inline")
    .map((t) => t.content)
    .join("");
}

// Removes leading/trailing whitespace from the first/last text tokens of an
// inline token list without mutating the parser's tokens.
function trimChildren(children) {
  const out = children.map((t) => t);
  while (out.length && out[0].type === "text" && out[0].content.trim() === "") out.shift();
  while (out.length && out[out.length - 1].type === "text" && out[out.length - 1].content.trim() === "") out.pop();
  if (out.length && out[0].type === "text") {
    out[0] = Object.assign(Object.create(Object.getPrototypeOf(out[0])), out[0], {
      content: out[0].content.replace(/^\s+/, ""),
    });
  }
  const last = out.length - 1;
  if (last >= 0 && out[last].type === "text") {
    out[last] = Object.assign(Object.create(Object.getPrototypeOf(out[last])), out[last], {
      content: out[last].content.replace(/\s+$/, ""),
    });
  }
  return out;
}

// Splits a cell's inline tokens into list items at each semicolon that sits
// in plain top-level text — not inside a link or emphasis, and not escaped
// as "\;" (which renders as a literal semicolon). Empty items are dropped.
function splitListItems(children) {
  const items = [[]];
  let depth = 0;
  for (const token of children) {
    if (depth === 0 && token.type === "text" && token.content.includes(";")) {
      token.content.split(";").forEach((piece, idx) => {
        if (idx > 0) items.push([]);
        if (piece) {
          const t = new token.constructor("text", "", 0);
          t.content = piece;
          items[items.length - 1].push(t);
        }
      });
      continue;
    }
    depth += token.nesting;
    items[items.length - 1].push(token);
  }
  return items.map(trimChildren).filter((item) => item.length > 0);
}

// A semicolon-separated cell becomes a bulleted list; a single item stays
// plain text.
function renderListCell(children) {
  const items = splitListItems(children);
  if (items.length <= 1) return renderInlineTokens(children);
  const lis = items.map((item) => `<li>${renderInlineTokens(item)}</li>`).join("");
  return `<ul class="pdp-list" role="list">${lis}</ul>`;
}

// ---------------------------------------------------------------- intro

function loadIntroduction(srcRoot, file) {
  const { tokens } = readMarkdown(srcRoot, file);
  if (tokens.length < 3 || tokens[0].type !== "heading_open" || tokens[0].tag !== "h1") {
    fail(file, lineOf(tokens[0]), 'must start with a top-level heading, e.g. "# Contextual Statement"');
  }
  const headingHtml = renderInlineTokens(tokens[1].children);
  const body = tokens.slice(3);
  if (body.length === 0) {
    fail(file, lineOf(tokens[0]), "has a heading but no text below it");
  }
  // The file's "#" heading becomes the section's <h2>, so shift any further
  // headings down one level to keep the page outline valid.
  for (const token of body) {
    if (token.type === "heading_open" || token.type === "heading_close") {
      const level = Math.min(Number(token.tag.slice(1)) + 1, 6);
      token.tag = `h${level}`;
    }
  }
  return { headingHtml, bodyHtml: md.renderer.render(body, md.options, {}).trim() };
}

// ---------------------------------------------------------------- goals

function parseObjectiveCell(file, line, cell) {
  const children = trimChildren(cell.children);
  if (
    children.length < 3 ||
    children[0].type !== "strong_open" ||
    children[2].type !== "strong_close" ||
    children[1].type !== "text"
  ) {
    fail(file, line, 'objective cell must start with a bold ID, e.g. "**G1.1** Develop scholarly relationships"');
  }
  const id = children[1].content.trim();
  const titleChildren = trimChildren(children.slice(3));
  if (titleChildren.length === 0) {
    fail(file, line, `objective ${id} has an ID but no objective text after it`);
  }
  return { id, titleHtml: renderInlineTokens(titleChildren), titleText: plainText(titleChildren).trim() };
}

function lookupCommitment(file, line, rawLabel) {
  const kind = COMMITMENT_KINDS[rawLabel.trim().toLowerCase()];
  if (!kind) {
    const allowed = Object.values(COMMITMENT_KINDS).map((k) => `"${k.label}"`).join(", ");
    fail(file, line, `unknown commitment label "${rawLabel.trim()}" (allowed: ${allowed})`);
  }
  return kind;
}

// Accepts either a bare label ("Core") or one or more bold-labelled parts:
// "**Core:** Annual proposal submission. **Stretch:** Journal publication"
function parseCommitmentCell(file, line, cell) {
  const children = trimChildren(cell.children);
  if (!children.some((t) => t.type === "strong_open")) {
    return [{ ...lookupCommitment(file, line, plainText(children)), detailHtml: null }];
  }

  const parts = [];
  let i = 0;
  while (i < children.length) {
    const token = children[i];
    if (token.type === "text" && token.content.trim() === "") {
      i += 1;
      continue;
    }
    if (token.type !== "strong_open" || children[i + 2]?.type !== "strong_close") {
      fail(file, line, 'commitment parts must each start with a bold label, e.g. "**Core:** ... **Stretch:** ..."');
    }
    const rawLabel = plainText([children[i + 1]]).trim();
    if (!rawLabel.endsWith(":")) {
      fail(file, line, `bold commitment label "${rawLabel}" should end with a colon, e.g. "**Stretch:**"`);
    }
    const kind = lookupCommitment(file, line, rawLabel.slice(0, -1));
    if (parts.some((p) => p.kind === kind.kind)) {
      fail(file, line, `commitment label "${kind.label}" appears twice in the same cell`);
    }
    i += 3;
    const detail = [];
    while (i < children.length && children[i].type !== "strong_open") {
      detail.push(children[i]);
      i += 1;
    }
    const detailChildren = trimChildren(detail);
    if (detailChildren.length === 0) {
      fail(file, line, `commitment "${kind.label}:" has no description after it`);
    }
    parts.push({ ...kind, detailHtml: renderInlineTokens(detailChildren) });
  }
  return parts;
}

function parseSupportsCell(file, line, cell) {
  const text = plainText(cell.children).trim();
  const refs = text.split(",").map((s) => s.trim());
  return refs.map((ref) => {
    const match = GOAL_REF_PATTERN.exec(ref);
    if (!match) {
      fail(file, line, `"Also Supports" entry "${ref}" should look like "G2" (comma-separated for several)`);
    }
    return Number(match[1]);
  });
}

// Collects rows from a markdown-it table token range as arrays of inline
// tokens (one per cell), plus the source line of each row.
function collectTableRows(tokens, start, end) {
  const header = [];
  const body = [];
  let current = null;
  let inHead = false;
  for (let i = start; i <= end; i += 1) {
    const t = tokens[i];
    if (t.type === "thead_open") inHead = true;
    else if (t.type === "thead_close") inHead = false;
    else if (t.type === "tr_open") current = { line: lineOf(t), cells: [] };
    else if (t.type === "inline" && current) current.cells.push(t);
    else if (t.type === "tr_close") {
      (inHead ? header : body).push(current);
      current = null;
    }
  }
  return { header: header[0], rows: body };
}

function loadGoal(srcRoot, file, expectedNumber) {
  const { tokens, lines } = readMarkdown(srcRoot, file);
  let i = 0;

  // 1. "# Goal N — Title"
  if (tokens[i]?.type !== "heading_open" || tokens[i].tag !== "h1") {
    fail(file, lineOf(tokens[i]), 'must start with a heading like "# Goal 1 — Title"');
  }
  const headingLine = lineOf(tokens[i]);
  const headingText = tokens[i + 1].content.trim();
  const headingMatch = GOAL_HEADING_PATTERN.exec(headingText);
  if (!headingMatch) {
    fail(file, headingLine, `heading "${headingText}" should look like "# Goal 1 — Title" (with an em dash —)`);
  }
  const number = Number(headingMatch[1]);
  if (number !== expectedNumber) {
    fail(file, headingLine, `is listed as goal ${expectedNumber} in src/data/pdp.js but its heading says Goal ${number}`);
  }
  const titleHtml = md.renderInline(headingMatch[2].trim());
  const titleText = headingMatch[2].trim();
  i += 3;

  // 2. Purpose paragraph (a single paragraph; typically italic)
  if (tokens[i]?.type !== "paragraph_open") {
    fail(file, lineOf(tokens[i]) || headingLine, "needs a one-sentence purpose statement paragraph below the heading");
  }
  let purposeChildren = trimChildren(tokens[i + 1].children);
  if (
    purposeChildren.length >= 2 &&
    purposeChildren[0].type === "em_open" &&
    purposeChildren[purposeChildren.length - 1].type === "em_close"
  ) {
    // The page styles the purpose in italics already; drop the wrapping <em>.
    purposeChildren = purposeChildren.slice(1, -1);
  }
  const purposeHtml = renderInlineTokens(purposeChildren);
  i += 3;

  // 3. The objectives table
  if (tokens[i]?.type !== "table_open") {
    fail(file, lineOf(tokens[i]) || headingLine, "needs an objectives table right after the purpose statement");
  }
  const tableStart = i;
  while (i < tokens.length && tokens[i].type !== "table_close") i += 1;
  const { header, rows } = collectTableRows(tokens, tableStart, i);
  i += 1;
  if (i < tokens.length) {
    fail(file, lineOf(tokens[i]), "has extra content after the objectives table (each goal file holds one heading, one purpose paragraph, and one table)");
  }

  const headers = header.cells.map((c) => c.content.trim());
  const expected = COLUMNS.map((c) => c.header);
  if (headers.length !== expected.length || headers.some((h, idx) => h !== expected[idx])) {
    fail(
      file,
      header.line,
      `table columns must be exactly: ${expected.join(" | ")}\n  found: ${headers.join(" | ")}`
    );
  }
  if (rows.length === 0) {
    fail(file, header.line, "objectives table has no rows");
  }

  const objectives = rows.map((row) => {
    const rawCount = countRawCells(lines[row.line - 1] || "");
    if (row.cells.length !== COLUMNS.length || rawCount > COLUMNS.length) {
      fail(file, row.line, `row has ${Math.max(rawCount, row.cells.length)} cells but the table has ${COLUMNS.length} columns`);
    }
    const cells = Object.fromEntries(COLUMNS.map((c, idx) => [c.key, row.cells[idx]]));
    for (const col of COLUMNS) {
      if (cells[col.key].content.trim() === "") {
        fail(file, row.line, `"${col.header}" cell is empty`);
      }
    }

    const { id, titleHtml: objTitleHtml, titleText: objTitleText } = parseObjectiveCell(file, row.line, cells.objective);
    const idMatch = OBJECTIVE_ID_PATTERN.exec(id);
    if (!idMatch) {
      fail(file, row.line, `objective ID "${id}" should look like "G${number}.1"`);
    }
    if (Number(idMatch[1]) !== number) {
      fail(file, row.line, `objective ${id} is in the Goal ${number} file; its ID should start with "G${number}."`);
    }

    return {
      id,
      anchor: `g${idMatch[1]}-${idMatch[2]}`,
      line: row.line,
      titleHtml: objTitleHtml,
      titleText: objTitleText,
      commitments: parseCommitmentCell(file, row.line, cells.commitment),
      stepsHtml: renderListCell(cells.steps.children),
      resourcesHtml: renderListCell(cells.resources.children),
      timelineHtml: renderListCell(cells.timeline.children),
      measureHtml: renderListCell(cells.measure.children),
      supports: parseSupportsCell(file, row.line, cells.supports),
    };
  });

  return { number, anchor: `goal-${number}`, file, titleHtml, titleText, purposeHtml, objectives };
}

// ---------------------------------------------------------------- entry point

function loadPdp(srcRoot, settings) {
  if (!Array.isArray(settings.goals) || settings.goals.length === 0) {
    throw new PdpContentError("src/data/pdp.js: `goals` must list at least one goal file");
  }

  const introduction = loadIntroduction(srcRoot, settings.introductionFile);
  const goals = settings.goals.map((entry, idx) => ({
    ...loadGoal(srcRoot, entry.file, idx + 1),
    navLabel: entry.navLabel,
  }));

  // Cross-file checks: unique objective IDs, valid "Also Supports" targets.
  const seen = new Map();
  for (const goal of goals) {
    for (const obj of goal.objectives) {
      if (seen.has(obj.id)) {
        fail(goal.file, obj.line, `objective ID ${obj.id} is already used in src/${seen.get(obj.id)}`);
      }
      seen.set(obj.id, goal.file);
      for (const ref of obj.supports) {
        if (ref < 1 || ref > goals.length) {
          fail(goal.file, obj.line, `objective ${obj.id} lists "Also Supports" G${ref}, but there is no Goal ${ref}`);
        }
      }
    }
  }

  const legendKinds = new Set((settings.legend || []).map((l) => l.kind));
  for (const kind of Object.values(COMMITMENT_KINDS)) {
    if (!legendKinds.has(kind.kind)) {
      throw new PdpContentError(`src/data/pdp.js: legend is missing an entry for kind "${kind.kind}"`);
    }
  }

  return {
    introduction,
    goals,
    objectiveCount: goals.reduce((n, g) => n + g.objectives.length, 0),
  };
}

module.exports = { loadPdp, COLUMNS, PdpContentError };
