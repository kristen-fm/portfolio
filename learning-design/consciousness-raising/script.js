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
  const prevText = prevButton.querySelector(".step-button__text");
  const scrollCue = document.querySelector("[data-scroll-cue]");

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

  // ---------- Build outline and heroes from the DOM ----------

  const outlineButtons = sections.map((section, i) => {
    const header = section.querySelector(".lesson-header");
    if (header && heroTemplate && section.dataset.noHero === undefined) {
      header.appendChild(heroTemplate.content.cloneNode(true));
    }

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

    // Hold the learner at the Reflect section until both prompts are answered.
    // Every way forward (Next, arrow keys, outline, deep links) runs through
    // here, so this one guard locks them all.
    if (sectionLocked(index)) {
      if (currentSection !== gateIndex) goToSection(gateIndex, { announce });
      if (announce) nudgeReflection();
      return;
    }

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

    prevButton.hidden = isFirst;
    prevButton.disabled = isFirst;
    prevText.textContent = isFirst ? "" : "Previous";

    // Next hides on the last section, mirroring Previous on the first.
    nextButton.hidden = isLast;
    nextButton.disabled = isLast;

    refreshGate();
    updateScrollCue();
  }

  const next = () => goToSection(currentSection + 1);
  const previous = () => goToSection(currentSection - 1);

  prevButton.addEventListener("click", previous);
  nextButton.addEventListener("click", next);

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

  // ---------- Accordions (panels toggle independently) ----------

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
        setExpanded(trigger, opening);
      });
    });
  });

  function setExpanded(trigger, expanded) {
    trigger.setAttribute("aria-expanded", String(expanded));
    document.getElementById(trigger.getAttribute("aria-controls")).hidden = !expanded;
  }

  // ---------- Reflection (progressive disclosure + persistence) ----------
  // Reflection 2 stays hidden until the learner clicks Continue. Typed answers
  // are saved to localStorage keyed by the textarea id, so they survive reloads
  // and return visits and can be echoed back in the Activity section. Storage
  // may be unavailable (private mode, blocked cookies); every access is guarded.
  const STORAGE_PREFIX = "cr-reflection:";

  function readStored(key) {
    try {
      return localStorage.getItem(STORAGE_PREFIX + key);
    } catch (error) {
      return null;
    }
  }

  function writeStored(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, value);
    } catch (error) {
      // Storage unavailable; answers still persist in the DOM this session.
    }
  }

  document.querySelectorAll("[data-reflection]").forEach((reflection) => {
    const revealButton = reflection.querySelector("[data-reflection-reveal]");
    const continueBlock = reflection.querySelector("[data-reflection-continue]");
    const second = reflection.querySelector(".reflect-card--second");

    function revealSecond({ animate }) {
      if (!second || !second.hidden) return;
      second.hidden = false;

      if (animate && !reducedMotion.matches) {
        // Start the card low and faded, then let it settle into place.
        second.classList.add("reflect-card--entering");
        void second.offsetHeight;
        second.classList.remove("reflect-card--entering");
      }

      if (animate) {
        // Move focus to the new question so it's announced.
        second.querySelector(".reflect-card__question").focus({ preventScroll: true });
        second.scrollIntoView({ behavior: scrollBehavior(), block: "nearest" });
      }

      // Retire the Continue affordance now that Reflection 2 is on screen.
      if (continueBlock) continueBlock.hidden = true;
    }

    if (revealButton && second) {
      revealButton.addEventListener("click", () => revealSecond({ animate: true }));
    }

    // Reflection fields grow to fit what's typed instead of scrolling inside.
    // Restore any saved answer first, then save and re-echo on every edit.
    reflection.querySelectorAll("[data-reflection-input]").forEach((input) => {
      const grow = () => {
        input.style.height = "auto";
        input.style.height = `${input.scrollHeight}px`;
      };

      const stored = readStored(input.id);
      if (stored) input.value = stored;

      input.addEventListener("input", () => {
        grow();
        writeStored(input.id, input.value);
        updateRecap();
        refreshGate();
      });

      grow();
    });

    // A returning learner who already answered Reflection 2 should see it
    // restored without having to click Continue again.
    const secondInput = second && second.querySelector("[data-reflection-input]");
    if (secondInput && secondInput.value.trim()) revealSecond({ animate: false });
  });

  // ---------- Reflection recap (Activity section echoes saved answers) ----------
  // Each [data-recap-for] names a reflection textarea; we mirror that question
  // and the learner's saved answer here, read-only, and keep it current on every
  // edit. The question text is pulled from the source card so it can't drift.
  const recapCards = Array.from(document.querySelectorAll("[data-recap-for]"));

  function updateRecap() {
    recapCards.forEach((card) => {
      const input = document.getElementById(card.dataset.recapFor);
      if (!input) return;

      const sourceQuestion = input.closest(".reflect-card").querySelector(".reflect-card__question");
      const questionSlot = card.querySelector("[data-recap-question]");
      if (questionSlot && sourceQuestion) questionSlot.textContent = sourceQuestion.textContent;

      const answer = input.value.trim();
      const answerSlot = card.querySelector("[data-recap-answer]");
      answerSlot.textContent = answer || "You haven't written a response to this one yet.";
      answerSlot.classList.toggle("recap-card__answer--empty", !answer);
    });
  }

  updateRecap();

  // ---------- Reflection gate ----------
  // Sections past the Reflect section stay locked until the learner has written
  // something in both prompts. Everything is derived from the DOM: whichever
  // section holds the reflection inputs is the gate, so reordering is safe.
  const reflectionInputs = Array.from(document.querySelectorAll("[data-reflection-input]"));
  const gateIndex = sections.findIndex((section) =>
    reflectionInputs.some((input) => section.contains(input)));
  const gateActive = gateIndex !== -1 && reflectionInputs.length > 0;
  const gateHint = document.querySelector("[data-gate-hint]");

  const reflectionsComplete = () =>
    !gateActive || reflectionInputs.every((input) => input.value.trim() !== "");

  // A section is locked when it sits beyond the gate and the gate isn't cleared.
  const sectionLocked = (index) =>
    gateActive && index > gateIndex && !reflectionsComplete();

  const isVisible = (element) => !!(element && element.offsetParent);

  // Reflect the current gate state in the controls: disable Next on the Reflect
  // section, lock the outline entries beyond it, and show the standing hint.
  function refreshGate() {
    if (!gateActive) return;
    const complete = reflectionsComplete();

    outlineButtons.forEach((button, i) => {
      const locked = i > gateIndex && !complete;
      button.disabled = locked;
      button.classList.toggle("course-outline__item--locked", locked);
    });

    if (currentSection === gateIndex) nextButton.disabled = !complete;
    if (gateHint) gateHint.hidden = !(currentSection === gateIndex && !complete);
  }

  // Called when the learner tries to leave early: announce why, pulse the hint,
  // and send focus to whatever still needs their attention — the first empty
  // visible field, or the Continue button if the second prompt isn't shown yet.
  function nudgeReflection() {
    if (!gateActive) return;

    status.textContent = "Please respond to both reflection prompts before moving on.";

    if (gateHint) {
      gateHint.hidden = false;
      gateHint.classList.remove("reflect-gate-hint--pulse");
      void gateHint.offsetWidth; // restart the animation
      gateHint.classList.add("reflect-gate-hint--pulse");
    }

    const revealButton = sections[gateIndex].querySelector("[data-reflection-reveal]");
    const target =
      reflectionInputs.find((input) => isVisible(input) && !input.value.trim()) ||
      (isVisible(revealButton) ? revealButton : null) ||
      reflectionInputs.find((input) => !input.value.trim());
    if (target) target.focus();
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
