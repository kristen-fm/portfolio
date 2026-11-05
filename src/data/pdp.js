// Page settings for the unlisted Professional Development Plan page (/pdp/).
// The plan itself — the contextual statement and every goal table — lives in
// Markdown under src/content/pdp/. This file only holds the page header text,
// the commitment legend, and the order in which goal files appear.
// See docs/CONTENT-GUIDE.md ("Professional Development Plan") for editing help.
module.exports = {
  documentTitle: "Professional Development Plan | Kristen Foster-Marks",
  metaDescription: "Professional Development Plan - Kristen Foster-Marks portfolio",

  eyebrow: "Graduate Studies / Professional Development",
  title: "Professional Development Plan",
  subtitleHtml:
    "The academic, scholarly, and professional goals guiding my graduate study in adult education and my preparation for doctoral work.",
  // Small metadata line under the subtitle. Add the planning period here
  // (e.g. "2025&ndash;2028") once it's settled; set to null to hide the line.
  metaLineHtml: "M.Ed. in Learning Design and Training &middot; Colorado State University",

  introductionFile: "content/pdp/introduction.md",

  // One entry per goal, in display order. Goal numbers in each file's heading
  // must run 1, 2, 3, ... in this order. `navLabel` is the short name used in
  // the sticky goal navigation.
  goals: [
    { file: "content/pdp/goal-1-community.md", navLabel: "Community" },
    { file: "content/pdp/goal-2-research.md", navLabel: "Research &amp; writing" },
    { file: "content/pdp/goal-3-practice.md", navLabel: "Practice" },
    { file: "content/pdp/goal-4-degree.md", navLabel: "Degree" },
    { file: "content/pdp/goal-5-doctorate.md", navLabel: "Doctorate" },
  ],

  // Legend shown in the overview. Keys must match the commitment labels the
  // goal tables are allowed to use (see src/lib/pdp.js COMMITMENT_KINDS).
  legend: [
    { kind: "core", label: "Core", descriptionHtml: "A commitment I intend to carry out." },
    { kind: "stretch", label: "Stretch", descriptionHtml: "An ambitious extension beyond the core commitment." },
    { kind: "outcome", label: "Desired outcome", descriptionHtml: "A hoped-for result that is not fully within my control." },
  ],
};
