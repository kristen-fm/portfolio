// Slide navigation for the learning experience.
// Everything is derived from the .slide elements in the DOM, so adding,
// removing, or reordering slides in index.html needs no changes here.
(function () {
  "use strict";

  const stage = document.getElementById("slide-stage");
  const slides = Array.from(stage.querySelectorAll(".slide"));
  const railList = document.querySelector(".section-rail__list");
  const counterCurrent = document.querySelector(".slide-counter__current");
  const counterTotal = document.querySelector(".slide-counter__total");
  const status = document.querySelector("[data-slide-status]");
  const prevButton = document.querySelector('[data-nav="prev"]');
  const nextButton = document.querySelector('[data-nav="next"]');
  const nextLabel = nextButton.querySelector(".nav-button__label");
  const finalLabel = nextButton.dataset.finalLabel || "Finish";
  const finalHref = nextButton.dataset.finalHref || "";

  // Vertical distance (px) slides travel while fading in or out.
  const SLIDE_OFFSET = 8;

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

  let currentSlide = -1;

  const pad = (n) => String(n).padStart(2, "0");
  const titleOf = (slide) => slide.querySelector(".slide-title");

  // Heading text with <br> line breaks read as spaces.
  function titleText(slide) {
    const clone = titleOf(slide).cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clone.textContent.replace(/\s+/g, " ").trim();
  }

  // ---------- Build rail + numbering from the DOM ----------

  const railButtons = slides.map((slide, i) => {
    const number = pad(i + 1);
    const label = slide.dataset.railLabel || titleText(slide);

    const eyebrow = slide.querySelector(".slide-eyebrow");
    if (eyebrow) eyebrow.prepend(`${number} — `);

    slide.id = slide.id || `slide-${i + 1}`;
    slide.inert = true;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "section-rail__item";
    button.setAttribute("aria-controls", slide.id);
    button.innerHTML =
      '<span class="section-rail__marker" aria-hidden="true"></span>' +
      `<span class="section-rail__number">${number}</span>` +
      '<span class="section-rail__label"></span>';
    button.querySelector(".section-rail__label").textContent = label;
    button.addEventListener("click", () => goToSlide(i));

    const item = document.createElement("li");
    item.appendChild(button);
    railList.appendChild(item);
    return button;
  });

  counterTotal.textContent = pad(slides.length);

  // ---------- Navigation ----------

  function goToSlide(index, { announce = true } = {}) {
    if (!Number.isInteger(index) || index < 0 || index >= slides.length) return;
    if (index === currentSlide) return;

    const direction = index > currentSlide ? 1 : -1;
    const outgoing = slides[currentSlide];
    const incoming = slides[index];
    const focusWasInOutgoing = outgoing && outgoing.contains(document.activeElement);

    if (outgoing) {
      outgoing.style.setProperty("--slide-offset", `${-direction * SLIDE_OFFSET}px`);
      outgoing.classList.remove("slide--active");
      outgoing.inert = true;
    }

    // Place the incoming slide at its starting offset without animating,
    // then let it transition into place.
    incoming.classList.add("slide--instant");
    incoming.style.setProperty("--slide-offset", `${direction * SLIDE_OFFSET}px`);
    void incoming.offsetHeight;
    incoming.classList.remove("slide--instant");
    incoming.classList.add("slide--active");
    incoming.inert = false;
    incoming.scrollTop = 0;

    currentSlide = index;
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
    if (focusWasInOutgoing || !active || active === document.body || active.disabled) {
      status.textContent = "";
      titleOf(incoming).focus({ preventScroll: true });
    } else {
      status.textContent =
        `Section ${index + 1} of ${slides.length}: ${titleText(incoming)}`;
    }
  }

  function updateControls() {
    const isFirst = currentSlide === 0;
    const isLast = currentSlide === slides.length - 1;

    railButtons.forEach((button, i) => {
      const active = i === currentSlide;
      button.classList.toggle("section-rail__item--active", active);
      if (active) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });

    counterCurrent.textContent = pad(currentSlide + 1);
    prevButton.disabled = isFirst;

    if (isLast) {
      nextLabel.textContent = finalLabel;
      // Placeholder until a destination is configured in data-final-href.
      nextButton.disabled = !finalHref;
    } else {
      nextLabel.textContent = "Next";
      nextButton.disabled = false;
    }
  }

  const next = () => goToSlide(currentSlide + 1);
  const previous = () => goToSlide(currentSlide - 1);

  prevButton.addEventListener("click", previous);
  nextButton.addEventListener("click", () => {
    if (currentSlide === slides.length - 1) {
      if (finalHref) window.location.assign(finalHref);
      return;
    }
    next();
  });

  // ---------- Keyboard ----------

  // Pixels one arrow press scrolls an overflowing slide.
  const ARROW_SCROLL_STEP = 48;

  // When the active slide's content overflows (mostly on phones), vertical
  // scrolling keys scroll it first; they only change slides once the slide
  // is already at the matching top or bottom edge. Returns true if it
  // scrolled. Left/Right always navigate.
  function scrollActiveSlide(key) {
    const slide = slides[currentSlide];
    const maxScroll = slide.scrollHeight - slide.clientHeight;
    if (maxScroll <= 1) return false;

    const atTop = slide.scrollTop <= 1;
    const atBottom = slide.scrollTop >= maxScroll - 1;
    const page = slide.clientHeight * 0.85;
    const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

    let top;
    switch (key) {
      case "ArrowDown": if (atBottom) return false; top = slide.scrollTop + ARROW_SCROLL_STEP; break;
      case "PageDown":  if (atBottom) return false; top = slide.scrollTop + page; break;
      case "End":       if (atBottom) return false; top = maxScroll; break;
      case "ArrowUp":   if (atTop) return false; top = slide.scrollTop - ARROW_SCROLL_STEP; break;
      case "PageUp":    if (atTop) return false; top = slide.scrollTop - page; break;
      case "Home":      if (atTop) return false; top = 0; break;
      default: return false;
    }
    slide.scrollTo({ top, behavior });
    return true;
  }

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target instanceof Element && event.target.closest(ARROW_KEY_OWNERS)) return;

    if (scrollActiveSlide(event.key)) {
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
        goToSlide(0);
        break;
      case "End":
        goToSlide(slides.length - 1);
        break;
      default:
        return;
    }
    event.preventDefault();
  });

  // ---------- Deep links (#3 opens section 3) ----------

  function slideFromHash() {
    const n = parseInt(location.hash.slice(1), 10);
    return Number.isInteger(n) && n >= 1 && n <= slides.length ? n - 1 : 0;
  }

  window.addEventListener("hashchange", () => goToSlide(slideFromHash()));

  goToSlide(slideFromHash(), { announce: false });
})();
