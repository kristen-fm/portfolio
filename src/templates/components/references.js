// APA 7 (§9.43) labels a reference list "References"; the site uses the
// singular "Reference" when a list has only one entry, matching the detail pages.
function referencesLabel(referencesHtml) {
  const count = (referencesHtml.match(/<p[\s>]/g) || []).length;
  return count === 1 ? "Reference" : "References";
}

module.exports = { referencesLabel };
