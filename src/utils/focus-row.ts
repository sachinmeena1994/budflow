// src/utils/focus-row.ts
function isVisible(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return !!(rect.width || rect.height);
}

function getRowRoot(fromEl: HTMLElement): HTMLElement | null {
  // Prefer explicit marker if your table rows are div-based
  return (
    fromEl.closest<HTMLElement>("[data-row-root]") ||
    fromEl.closest<HTMLElement>("tr")
  );
}

export function getRowFocusables(fromEl: HTMLElement): HTMLElement[] {
  const row = getRowRoot(fromEl);
  if (!row) return [];
  const candidates = Array.from(
    row.querySelectorAll<HTMLElement>(
      '[data-focusable="true"], input, select, textarea, button, [tabindex]'
    )
  );
  return candidates.filter(
    (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1 && isVisible(el)
  );
}

export function focusNext(fromEl: HTMLElement) {
  const items = getRowFocusables(fromEl);
  const i = items.indexOf(fromEl);
  const next = items[i + 1];
  if (next) next.focus();
}

export function focusPrev(fromEl: HTMLElement) {
  const items = getRowFocusables(fromEl);
  const i = items.indexOf(fromEl);
  const prev = items[i - 1];
  if (prev) prev.focus();
}
