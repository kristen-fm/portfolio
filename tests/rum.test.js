const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../assets/js/rum.js"), "utf8");

function setup({ pathname = "/", loading = false, main = true } = {}) {
  const events = { document: {}, window: {} };
  const actions = [];
  const ready = [];
  const timers = [];
  let bounds = { top: 100, height: 4000 };
  const listen = (scope) => (name, callback) => {
    (events[scope][name] ||= []).push(callback);
  };
  const document = {
    baseURI: `https://portfolio.example${pathname}`,
    readyState: loading ? "loading" : "complete",
    addEventListener: listen("document"),
    createElement: () => ({}),
    getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }],
    querySelector: () => main ? { getBoundingClientRect: () => bounds } : null,
  };
  const window = {
    location: new URL(document.baseURI),
    innerHeight: 800,
    addEventListener: listen("window"),
    setTimeout: (callback) => timers.push(callback),
    DD_RUM: {
      onReady: (callback) => ready.push(callback),
      init() {},
      addAction: (name, context) => actions.push({ name, context }),
    },
  };
  vm.runInNewContext(source, { window, document, URL, Set });
  function emit(scope, name, event = {}) {
    for (const callback of events[scope][name] || []) callback(event);
  }
  return {
    actions, events, timers,
    ready() { while (ready.length) ready.shift()(); },
    flush() { while (timers.length) timers.shift()(); },
    bounds(value) { bounds = value; },
    emit,
    click(options, nested = false) {
      const link = anchor(options);
      emit("document", "click", { target: nested ? { closest: () => link } : link });
    },
  };
}

// Minimal DOM doubles: browser URL resolution, link ancestry, and visible text
// are inputs; assertions below cover the emitted tracking-plan contract.
function anchor({ classes = [], href = "#", text = "", articleId, toc = false, target = "" } = {}) {
  const link = {
    classList: { contains: (name) => classes.includes(name) },
    getAttribute: (name) => name === "href" ? href : null,
    innerText: text,
    target,
    matches: () => toc,
    closest: (selector) => selector === "article" ? (articleId ? { id: articleId } : null) : link,
  };
  return link;
}

function recorded(runtime) {
  runtime.ready();
  // Normalize objects created in the VM's separate realm.
  return JSON.parse(JSON.stringify(runtime.actions));
}

test("CV and all LinkedIn placements emit exactly one custom action, even on nested clicks", () => {
  const runtime = setup();
  runtime.click({ classes: ["cv-download"], href: "/assets/cv.pdf" }, true);
  for (const placement of ["header", "nav", "footer"]) {
    runtime.click({ classes: [`${placement}-linkedin`], href: "https://www.linkedin.com/in/profile/" }, true);
  }
  assert.equal(runtime.actions.length, 0, "wait for SDK readiness");
  assert.deepEqual(recorded(runtime), [
    { name: "cv_downloaded" },
    ...["header", "nav", "footer"].map((placement) => ({
      name: "linkedin_profile_clicked", context: { placement },
    })),
  ]);
  assert.equal(runtime.events.document.click.length, 1);
});

test("outbound actions retain markup href and trimmed visible label", () => {
  const runtime = setup();
  for (const href of ["https://doi.org/10.123/example", "http://other.example/paper", "//other.example/workbook"]) {
    runtime.click({ href, text: "  Read the preprint \n" });
  }
  assert.deepEqual(recorded(runtime), ["https://doi.org/10.123/example", "http://other.example/paper", "//other.example/workbook"].map((href) => ({
    name: "outbound_link_clicked", context: { link_url: href, link_text: "Read the preprint" },
  })));
});

test("internal, non-web, invalid and LinkedIn links do not emit outbound actions", () => {
  const runtime = setup();
  for (const href of ["/cv/", "#entry", "https://portfolio.example/cv/", "mailto:hello@example.com", "tel:123", "javascript:void(0)", "https://[invalid", "https://linkedin.com/in/profile", "https://uk.linkedin.com/in/profile"]) {
    runtime.click({ href });
  }
  runtime.emit("document", "click", { target: { closest: () => null } });
  assert.deepEqual(recorded(runtime), []);
});

test("entry links include IDs when present and never duplicate outbound actions", () => {
  const runtime = setup();
  for (const [href, target, external] of [["/reflections/post/", "", false], ["https://other.example/paper", "_blank", true], ["/assets/workbook.pdf", "_blank", true]]) {
    runtime.click({ classes: ["entry-link"], href, target, text: " View the workbook → ", articleId: "workbook" }, true);
    const action = recorded(runtime).at(-1);
    assert.deepEqual(action, {
      name: "entry_link_clicked",
      context: { entry_id: "workbook", link_url: href, link_text: "View the workbook →", is_external: external },
    });
  }
  runtime.click({ classes: ["entry-link"], href: "/scholarship/" });
  assert.deepEqual(recorded(runtime).at(-1).context, { link_url: "/scholarship/", link_text: "", is_external: false });
  assert.equal(runtime.actions.length, 4);
  runtime.click({ classes: ["entry-link", "back-to-toc"], href: "#" });
  assert.equal(recorded(runtime).length, 4);
});

test("ToC rows emit only their target fragment ID", () => {
  const runtime = setup();
  runtime.click({ classes: ["toc-link"], href: "#technical-upskilling", toc: true }, true);
  assert.deepEqual(recorded(runtime), [{ name: "toc_link_clicked", context: { entry_id: "technical-upskilling" } }]);
});

test("scroll milestones use main bounds, throttle bursts, and fire once per view", () => {
  const runtime = setup({ pathname: "/reflections/post/", loading: true });
  assert.equal(runtime.events.window.scroll, undefined);
  runtime.emit("document", "DOMContentLoaded");
  assert.deepEqual(recorded(runtime), []);
  for (const depth of [25, 50, 75, 100, 50, 100]) {
    runtime.bounds({ top: 800 - 4000 * depth / 100, height: 4000 });
    runtime.emit("window", "scroll");
    runtime.emit("window", "scroll");
    assert.equal(runtime.timers.length, 1);
    runtime.flush();
  }
  const expected = [25, 50, 75, 100].map((depth_percent) => ({ name: "article_scroll_depth_reached", context: { depth_percent } }));
  assert.deepEqual(recorded(runtime), expected);
  runtime.emit("window", "pageshow", { persisted: false });
  runtime.flush();
  assert.equal(recorded(runtime).length, 4);
  runtime.emit("window", "pageshow", { persisted: true });
  runtime.flush();
  assert.deepEqual(recorded(runtime), [...expected, ...expected]);
});

test("initial visibility, resize, and restored/jumped scroll positions include crossed milestones", () => {
  const runtime = setup({ pathname: "/pdp/" });
  runtime.bounds({ top: -2200, height: 4000 });
  runtime.emit("window", "resize");
  runtime.flush();
  assert.deepEqual(recorded(runtime).map((a) => a.context.depth_percent), [25, 50, 75]);
  runtime.bounds({ top: -3200, height: 4000 });
  runtime.emit("window", "load");
  runtime.flush();
  assert.deepEqual(recorded(runtime).map((a) => a.context.depth_percent), [25, 50, 75, 100]);
});

test("scroll tracking applies only to portfolio detail pages and PDP", () => {
  for (const pathname of ["/reflections/post/", "/scholarship/paper/index.html", "/learning-design/piece/", "/pdp/index.html"]) {
    const runtime = setup({ pathname });
    assert.equal(runtime.events.window.scroll.length, 1, pathname);
  }
  for (const pathname of ["/", "/cv/", "/reflections/", "/scholarship/index.html", "/learning-design/"]) {
    assert.equal(setup({ pathname }).events.window.scroll, undefined, pathname);
  }
  assert.equal(setup({ pathname: "/learning-design/consciousness-raising/", main: false }).events.window.scroll, undefined);
});
