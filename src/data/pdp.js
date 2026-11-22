// Page settings for the unlisted Professional Development Plan page (/pdp/).
// The plan itself — the contextual statement and every goal table — lives in
// Markdown under src/content/pdp/. This file only holds the page header text
// and the order in which goal files appear.
// See docs/CONTENT-GUIDE.md ("Professional Development Plan") for editing help.
module.exports = {
  documentTitle: "Professional Development Plan | Kristen Foster-Marks",
  metaDescription: "Professional Development Plan - Kristen Foster-Marks portfolio",

  title: "Professional Development Plan",

  introductionFile: "content/pdp/introduction.md",

  // Optional APA reference list, rendered after the goals. Remove this line
  // to drop the References section from the page.
  referencesFile: "content/pdp/references.md",

  // One entry per goal, in display order. Goal numbers in each file's heading
  // must run 1, 2, 3, ... in this order.
  goals: [
    { file: "content/pdp/goal-1-community.md" },
    { file: "content/pdp/goal-2-research.md" },
    { file: "content/pdp/goal-3-practice.md" },
    { file: "content/pdp/goal-4-degree.md" },
    { file: "content/pdp/goal-5-doctorate.md" },
  ],
};
