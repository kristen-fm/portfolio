// Mobile menu toggle. On narrow screens the nav is collapsed behind a button
// (see "Mobile menu" in styles.css). Without JavaScript the <html> element never
// gets the `js` class, so the full menu simply stays visible.
(function () {
  var toggle = document.querySelector(".nav-toggle");
  var header = document.querySelector(".site-header");
  if (!toggle || !header) return;

  var desktop = window.matchMedia("(min-width: 641px)");

  // In the mobile menu, hide the link for the exact page you're already on.
  // Matching the full path (not aria-current) keeps a section link visible on
  // that section's detail pages, e.g. "Scholarship" on a scholarship post.
  function normalize(path) {
    return path.replace(/index\.html$/, "").replace(/\/?$/, "/");
  }
  var here = normalize(window.location.pathname);
  document.querySelectorAll("nav.primary-nav a[href^='/']").forEach(function (link) {
    if (normalize(link.pathname) === here) link.classList.add("nav-here");
  });

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Menu");
    header.classList.toggle("nav-open", open);
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  // Escape closes the menu and returns focus to the button.
  header.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });

  // Reset when the viewport grows past the mobile breakpoint (e.g. rotating a tablet).
  desktop.addEventListener("change", function (event) {
    if (event.matches) setOpen(false);
  });
})();
