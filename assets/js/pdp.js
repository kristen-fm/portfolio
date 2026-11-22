// Progressive enhancements for /pdp/. Everything on the page works without
// this script: goals use native <details> (open by default) and navigation is
// plain anchor links. This adds:
//   - "Expand all" / "Collapse all" controls
//   - auto-opening a collapsed goal when you follow a link into it
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
