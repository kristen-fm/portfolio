// Section navigation for the mini-course.
// Everything is derived from the .lesson-section elements in the DOM, so
// adding, removing, or reordering sections in index.html needs no changes here.
(function () {
  "use strict";

  const stage = document.getElementById("lesson-stage");
  const sections = Array.from(stage.querySelectorAll(".lesson-section"));
  const outline = document.getElementById("course-outline");
  const outlineList = outline.querySelector(".course-outline__list");
  const outlineToggle = document.querySelector(".outline-toggle");
  const outlineBackdrop = document.querySelector(".outline-backdrop");
  const heroTemplate = document.getElementById("hero-template");
  const status = document.querySelector("[data-section-status]");
  const prevButton = document.querySelector('[data-nav="prev"]');
  const nextButton = document.querySelector('[data-nav="next"]');
  const prevTarget = prevButton.querySelector("[data-nav-target]");
  const nextTarget = nextButton.querySelector("[data-nav-target]");
  const nextText = nextButton.querySelector(".step-button__text");
  const scrollCue = document.querySelector("[data-scroll-cue]");
  const finalLabel = nextButton.dataset.finalLabel || "Finish";
  const finalHref = nextButton.dataset.finalHref || "";

  // Vertical distance (px) sections travel while fading in or out.
  const SECTION_OFFSET = 8;

  // Below this width the outline is an off-canvas drawer (matches styles.css).
  const drawerQuery = matchMedia("(max-width: 900px)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  // Arrow keys belong to these controls when they have focus.
  const ARROW_KEY_OWNERS = [
    "input",
    "textarea",
    "select",
    "[contenteditable]",
    '[role="slider"]',
    '[role="listbox"]',
    '[role="radiogroup"]',
    '[role="tablist"]',
    '[role="menu"]',
    '[role="grid"]',
    "[data-arrow-keys]",
  ].join(",");

  let currentSection = -1;

  const titleOf = (section) => section.querySelector(".lesson-title");
  const titleText = (section) => titleOf(section).textContent.replace(/\s+/g, " ").trim();
  const labels = sections.map((section) => section.dataset.outlineLabel || titleText(section));
  const scrollBehavior = () => (reducedMotion.matches ? "auto" : "smooth");

  // ---------- Build outline, eyebrows, and heroes from the DOM ----------

  const outlineButtons = sections.map((section, i) => {
    const eyebrow = section.querySelector(".lesson-eyebrow");
    if (eyebrow) eyebrow.textContent = `Section ${i + 1} of ${sections.length}`;

    const header = section.querySelector(".lesson-header");
    if (header && heroTemplate) header.appendChild(heroTemplate.content.cloneNode(true));

    section.id = section.id || `section-${i + 1}`;
    section.inert = true;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "course-outline__item";
    button.setAttribute("aria-controls", section.id);
    button.innerHTML =
      `<span class="course-outline__number" aria-hidden="true">${i + 1}</span>` +
      '<span class="course-outline__label"></span>';
    button.querySelector(".course-outline__label").textContent = labels[i];
    button.addEventListener("click", () => {
      goToSection(i);
      closeOutline();
    });

    const item = document.createElement("li");
    item.appendChild(button);
    outlineList.appendChild(item);
    return button;
  });

  // ---------- Navigation ----------

  function goToSection(index, { announce = true } = {}) {
    if (!Number.isInteger(index) || index < 0 || index >= sections.length) return;
    if (index === currentSection) return;

    const direction = index > currentSection ? 1 : -1;
    const outgoing = sections[currentSection];
    const incoming = sections[index];
    const focusWasInOutgoing = outgoing && outgoing.contains(document.activeElement);

    if (outgoing) {
      outgoing.style.setProperty("--section-offset", `${-direction * SECTION_OFFSET}px`);
      outgoing.classList.remove("lesson-section--active");
      outgoing.inert = true;
    }

    // Place the incoming section at its starting offset without animating,
    // then let it transition into place.
    incoming.classList.add("lesson-section--instant");
    incoming.style.setProperty("--section-offset", `${direction * SECTION_OFFSET}px`);
    void incoming.offsetHeight;
    incoming.classList.remove("lesson-section--instant");
    incoming.classList.add("lesson-section--active");
    incoming.inert = false;
    incoming.scrollTop = 0;

    currentSection = index;
    updateControls();

    if (location.hash !== `#${index + 1}`) {
      history.replaceState(null, "", `#${index + 1}`);
    }

    if (!announce) return;

    // Announce each change exactly once. Keep focus on the control the
    // learner used (so repeated Next presses work) and announce through the
    // live region; only if focus would otherwise be lost, move it to the new
    // heading instead and let the focus change do the announcing.
    const active = document.activeElement;
    if (focusWasInOutgoing || !active || active === document.body || active.disabled || outline.contains(active)) {
      status.textContent = "";
      titleOf(incoming).focus({ preventScroll: true });
    } else {
      status.textContent =
        `Section ${index + 1} of ${sections.length}: ${titleText(incoming)}`;
    }
  }

  function updateControls() {
    const isFirst = currentSection === 0;
    const isLast = currentSection === sections.length - 1;

    outlineButtons.forEach((button, i) => {
      const active = i === currentSection;
      button.classList.toggle("course-outline__item--active", active);
      if (active) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });

    prevButton.disabled = isFirst;
    prevTarget.textContent = isFirst ? "" : `${currentSection}. ${labels[currentSection - 1]}`;

    if (isLast) {
      nextText.textContent = finalLabel;
      nextTarget.textContent = "";
      // Placeholder until a destination is configured in data-final-href.
      nextButton.disabled = !finalHref;
    } else {
      nextText.textContent = "Next";
      nextTarget.textContent = `${currentSection + 2}. ${labels[currentSection + 1]}`;
      nextButton.disabled = false;
    }

    updateScrollCue();
  }

  const next = () => goToSection(currentSection + 1);
  const previous = () => goToSection(currentSection - 1);

  prevButton.addEventListener("click", previous);
  nextButton.addEventListener("click", () => {
    if (currentSection === sections.length - 1) {
      if (finalHref) window.location.assign(finalHref);
      return;
    }
    next();
  });

  // ---------- Scroll cue ----------

  // Shown only while the active section has more content below the fold.
  function updateScrollCue() {
    const section = sections[currentSection];
    if (!section) return;
    const remaining = section.scrollHeight - section.clientHeight - section.scrollTop;
    scrollCue.classList.toggle("scroll-cue--hidden", remaining <= 4);
  }

  scrollCue.addEventListener("click", () => {
    const section = sections[currentSection];
    section.scrollBy({ top: section.clientHeight * 0.75, behavior: scrollBehavior() });
  });

  // Scroll events don't bubble, so listen in the capture phase.
  stage.addEventListener("scroll", updateScrollCue, { capture: true, passive: true });
  // Catches resizes, font loading, and accordions opening or closing.
  const resizeObserver = new ResizeObserver(updateScrollCue);
  sections.forEach((section) => {
    resizeObserver.observe(section);
    resizeObserver.observe(section.firstElementChild);
  });

  // ---------- Accordions (one panel open at a time) ----------

  document.querySelectorAll(".accordion").forEach((accordion, a) => {
    const triggers = Array.from(accordion.querySelectorAll(".accordion__trigger"));

    triggers.forEach((trigger, i) => {
      const panel = trigger.closest(".accordion__item").querySelector(".accordion__panel");
      trigger.id = `accordion-${a + 1}-trigger-${i + 1}`;
      panel.id = `accordion-${a + 1}-panel-${i + 1}`;
      trigger.setAttribute("aria-controls", panel.id);
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", trigger.id);
      panel.hidden = trigger.getAttribute("aria-expanded") !== "true";

      trigger.addEventListener("click", () => {
        const opening = trigger.getAttribute("aria-expanded") !== "true";
        triggers.forEach((other) => setExpanded(other, opening && other === trigger));
      });
    });
  });

  function setExpanded(trigger, expanded) {
    trigger.setAttribute("aria-expanded", String(expanded));
    document.getElementById(trigger.getAttribute("aria-controls")).hidden = !expanded;
  }

  // ---------- Outline drawer (narrow screens) ----------

  function setOutlineOpen(open) {
    outline.classList.toggle("course-outline--open", open);
    outlineToggle.setAttribute("aria-expanded", String(open));
    outlineBackdrop.hidden = !open;
    syncOutlineInert();
  }

  function closeOutline() {
    if (!outline.classList.contains("course-outline--open")) return;
    setOutlineOpen(false);
    outlineToggle.focus();
  }

  // On narrow screens the closed drawer is off-canvas, so keep it out of the
  // tab order; while it's open, the rest of the page is inert instead.
  function syncOutlineInert() {
    const drawer = drawerQuery.matches;
    const open = outline.classList.contains("course-outline--open");
    outline.inert = drawer && !open;
    document.querySelector(".lesson-column").inert = drawer && open;
  }

  outlineToggle.addEventListener("click", () => {
    const open = !outline.classList.contains("course-outline--open");
    setOutlineOpen(open);
    if (open) (outline.querySelector("[aria-current]") || outlineButtons[0]).focus();
  });
  outlineBackdrop.addEventListener("click", closeOutline);
  drawerQuery.addEventListener("change", () => {
    if (!drawerQuery.matches) setOutlineOpen(false);
    syncOutlineInert();
  });
  syncOutlineInert();

  // ---------- Header dialogs ----------

  document.querySelectorAll("[data-dialog]").forEach((button) => {
    const dialog = document.getElementById(button.dataset.dialog);
    button.addEventListener("click", () => dialog.showModal());
  });

  // Clicking the backdrop (outside the dialog box) closes it.
  document.querySelectorAll(".info-dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  // ---------- Keyboard ----------

  // Pixels one arrow press scrolls an overflowing section.
  const ARROW_SCROLL_STEP = 48;

  // When the active section's content overflows, vertical scrolling keys
  // scroll it first; they only change sections once it's already at the
  // matching top or bottom edge. Returns true if it scrolled. Left/Right
  // always navigate.
  function scrollActiveSection(key) {
    const section = sections[currentSection];
    const maxScroll = section.scrollHeight - section.clientHeight;
    if (maxScroll <= 1) return false;

    const atTop = section.scrollTop <= 1;
    const atBottom = section.scrollTop >= maxScroll - 1;
    const page = section.clientHeight * 0.85;

    let top;
    switch (key) {
      case "ArrowDown": if (atBottom) return false; top = section.scrollTop + ARROW_SCROLL_STEP; break;
      case "PageDown":  if (atBottom) return false; top = section.scrollTop + page; break;
      case "End":       if (atBottom) return false; top = maxScroll; break;
      case "ArrowUp":   if (atTop) return false; top = section.scrollTop - ARROW_SCROLL_STEP; break;
      case "PageUp":    if (atTop) return false; top = section.scrollTop - page; break;
      case "Home":      if (atTop) return false; top = 0; break;
      default: return false;
    }
    section.scrollTo({ top, behavior: scrollBehavior() });
    return true;
  }

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) return;
    if (document.querySelector("dialog[open]")) return;

    if (event.key === "Escape") {
      closeOutline();
      return;
    }

    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target instanceof Element && event.target.closest(ARROW_KEY_OWNERS)) return;
    if (outline.classList.contains("course-outline--open")) return;

    if (scrollActiveSection(event.key)) {
      event.preventDefault();
      return;
    }

    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
      case "PageDown":
        next();
        break;
      case "ArrowUp":
      case "ArrowLeft":
      case "PageUp":
        previous();
        break;
      case "Home":
        goToSection(0);
        break;
      case "End":
        goToSection(sections.length - 1);
        break;
      default:
        return;
    }
    event.preventDefault();
  });

  // ---------- Deep links (#3 opens section 3) ----------

  function sectionFromHash() {
    const n = parseInt(location.hash.slice(1), 10);
    return Number.isInteger(n) && n >= 1 && n <= sections.length ? n - 1 : 0;
  }

  window.addEventListener("hashchange", () => goToSection(sectionFromHash()));

  goToSection(sectionFromHash(), { announce: false });
})();
