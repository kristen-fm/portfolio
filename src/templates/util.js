// Escapes a plain-text value for safe insertion into an HTML attribute or
// text node. Use this only for genuinely plain-text fields (no intentional
// markup or pre-encoded entities) — fields that already contain hand-typed
// HTML (the `...Html`-suffixed fields throughout src/data/) must NOT be
// passed through this, or their entities would be double-escaped
// (e.g. "&mdash;" -> "&amp;mdash;").
function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

module.exports = { escapeAttr };
