// Progressive enhancements for /pdp/. Everything on the page works without
// this script: goals use native <details> (open by default) and navigation is
// plain anchor links. This adds:
//   - "Expand all" / "Collapse all" controls
//   - auto-opening a collapsed goal when you follow a link into it
//   - highlighting the goal currently in view in the sticky goal nav
//   - making the table scroll region focusable only when it actually scrolls
(function () {
  "use strict";

  var root = document.querySelector(".pdp");
  if (!root) return;

  var allDetails = Array.prototype.slice.call(root.querySelectorAll(".pdp-goal-details"));

  // ---- Expand all / Collapse all
  var toolbar = root.querySelector("[data-pdp-toolbar]");
  if (toolbar && allDetails.length) {
    toolbar.hidden = false;
    toolbar.querySelector("[data-pdp-expand]").addEventListener("click", function () {
      allDetails.forEach(function (d) { d.open = true; });
    });
    toolbar.querySelector("[data-pdp-collapse]").addEventListener("click", function () {
      allDetails.forEach(function (d) { d.open = false; });
    });
  }

  // ---- Open the goal containing a link target (e.g. #g2-3) if collapsed
  function revealHashTarget() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    var details = target.closest(".pdp-goal-details");
    if (details && !details.open) {
      details.open = true;
      target.scrollIntoView();
    }
  }
  window.addEventListener("hashchange", revealHashTarget);
  revealHashTarget();

  // ---- Highlight the goal in view in the sticky nav
  var navLinks = Array.prototype.slice.call(root.querySelectorAll(".pdp-goalnav a"));
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var visible = new Set();
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        // The first section (in document order) that's in the band wins.
        var current = sections.find(function (s) { return visible.has(s.id); });
        navLinks.forEach(function (a) {
          if (current && a.getAttribute("href") === "#" + current.id) {
            a.setAttribute("aria-current", "location");
          } else {
            a.removeAttribute("aria-current");
          }
        });
      },
      // A band across the upper-middle of the viewport, below the sticky nav.
      { rootMargin: "-20% 0px -60% 0px" }
    );
    sections.forEach(function (s) { observer.observe(s); });
  }

  // ---- Only make table regions keyboard-focusable when they scroll
  var regions = Array.prototype.slice.call(root.querySelectorAll(".pdp-table-wrap"));
  function updateRegionFocusability() {
    regions.forEach(function (r) {
      if (r.scrollWidth > r.clientWidth + 1) r.setAttribute("tabindex", "0");
      else r.removeAttribute("tabindex");
    });
  }
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateRegionFocusability, 150);
  });
  allDetails.forEach(function (d) { d.addEventListener("toggle", updateRegionFocusability); });
  updateRegionFocusability();
})();
