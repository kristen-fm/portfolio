// Inline SVG icons for the mobile menu. All use currentColor so they follow
// the link's text color. They are decorative (the label carries the meaning),
// so each is aria-hidden. Hidden entirely on desktop via CSS.

const open = (cls) =>
  `<svg class="${cls}" viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">`;

const icons = {
  // Mountain range
  mountain: `${open("nav-icon")}<path d="M3 24 11 11l4 6 3-4 11 11"/><path d="m9 15 2-4 2.5 3.5"/><path d="M3 24h26"/></svg>`,
  // Stacked books
  books: `${open("nav-icon")}<rect x="4" y="5" width="24" height="7" rx="3"/><rect x="4" y="12.5" width="24" height="7" rx="3"/><rect x="4" y="20" width="24" height="7" rx="3"/></svg>`,
  // Laptop
  laptop: `${open("nav-icon")}<rect x="6" y="6" width="20" height="14" rx="1.5"/><path d="M3 25h26"/><path d="M3 25l2-5h22l2 5"/></svg>`,
  // Sprout
  sprout: `${open("nav-icon")}<path d="M16 28V15"/><path d="M16 17C16 11 12 8 6 8c0 6 3 9 10 9z"/><path d="M16 14c0-4 3-7 9-7 0 5-3 8-9 8"/></svg>`,
  // Document with person
  document: `${open("nav-icon")}<path d="M8 4h11l6 6v18H8z"/><path d="M19 4v6h6"/><circle cx="14" cy="14.5" r="2"/><path d="M11 20c0-2 1.5-3 3-3s3 1 3 3z"/><path d="M12 24h8"/></svg>`,
};

const arrow = `${open("nav-arrow")}<path d="M6 16h20"/><path d="m19 9 7 7-7 7"/></svg>`;

// Hamburger that morphs into an X when aria-expanded="true" (see styles.css).
const menuToggle = `<svg class="nav-toggle-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path class="bar-top" d="M4 7h16"/><path class="bar-mid" d="M4 12h16"/><path class="bar-bot" d="M4 17h16"/></svg>`;

module.exports = { icons, arrow, menuToggle };
