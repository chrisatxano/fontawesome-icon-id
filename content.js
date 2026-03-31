/**
 * Extracts a Font Awesome icon name from an element.
 *
 * Supports:
 *  - FA 5/6 CSS classes: fa-solid fa-house, fa-regular fa-user, fas fa-home, etc.
 *  - FA 4 classes: fa fa-home
 *  - FA SVG-with-JS: <svg data-icon="house" ...> and its child elements
 */
function getIconName(el) {
  // Walk up a few levels so clicks on inner <path>/<g> inside SVGs still work
  for (let node = el, depth = 0; node && depth < 5; node = node.parentElement, depth++) {
    const name = extractFromNode(node);
    if (name) return name;
  }
  return null;
}

function extractFromNode(el) {
  // 1. Check data-icon attribute (FA SVG+JS puts this on <svg> elements)
  if (el.dataset?.icon) {
    return el.dataset.icon;
  }

  // 2. For SVG child elements (path, g, etc.), look for the nearest ancestor <svg>
  const tag = el.tagName?.toLowerCase();
  if (tag === "path" || tag === "g" || tag === "use" || tag === "circle" ||
      tag === "rect" || tag === "line" || tag === "polygon") {
    let parent = el.parentElement;
    while (parent) {
      if (parent.tagName?.toLowerCase() === "svg" && parent.dataset?.icon) {
        return parent.dataset.icon;
      }
      parent = parent.parentElement;
    }
  }

  // 3. CSS class-based icons (FA 4/5/6)
  const classList = el.classList;
  if (!classList) return null;

  for (const cls of classList) {
    // Match fa-<name> but skip style prefixes and meta classes
    if (
      cls.startsWith("fa-") &&
      !isStyleOrMeta(cls)
    ) {
      return cls.slice(3); // strip "fa-"
    }
  }

  return null;
}

const STYLE_AND_META = new Set([
  "fa-solid", "fa-regular", "fa-light", "fa-thin", "fa-duotone",
  "fa-brands", "fa-sharp", "fa-sharp-solid", "fa-sharp-regular",
  "fa-sharp-light", "fa-sharp-thin", "fa-sharp-duotone",
  "fa-classic", "fa-fw", "fa-lg", "fa-xs", "fa-sm", "fa-1x",
  "fa-2x", "fa-3x", "fa-4x", "fa-5x", "fa-6x", "fa-7x",
  "fa-8x", "fa-9x", "fa-10x", "fa-spin", "fa-pulse",
  "fa-flip-horizontal", "fa-flip-vertical", "fa-flip-both",
  "fa-rotate-90", "fa-rotate-180", "fa-rotate-270",
  "fa-stack", "fa-stack-1x", "fa-stack-2x", "fa-inverse",
  "fa-layers", "fa-layers-text", "fa-layers-counter",
  "fa-pull-left", "fa-pull-right", "fa-border",
  "fa-swap-opacity", "fa-li", "fa-ul",
  "fa-pull-undefined",
]);

function isStyleOrMeta(cls) {
  return STYLE_AND_META.has(cls);
}

// ── Tooltip on hover ──────────────────────────────────────────────────

let tooltip = null;
let lastTarget = null;

function ensureTooltip() {
  if (tooltip) return tooltip;
  tooltip = document.createElement("div");
  tooltip.className = "fa-id-tooltip";
  document.body.appendChild(tooltip);
  return tooltip;
}

function showTooltip(el, iconName) {
  const tip = ensureTooltip();
  tip.textContent = `fa-${iconName}`;
  tip.classList.add("fa-id-tooltip--visible");

  const rect = el.getBoundingClientRect();
  tip.style.left = `${rect.left + rect.width / 2}px`;
  tip.style.top = `${rect.top - 4}px`;
}

function hideTooltip() {
  if (tooltip) {
    tooltip.classList.remove("fa-id-tooltip--visible");
  }
  lastTarget = null;
}

document.addEventListener("mouseover", (e) => {
  if (e.target === lastTarget) return;
  const iconName = getIconName(e.target);
  if (iconName) {
    lastTarget = e.target;
    showTooltip(e.target, iconName);
  } else {
    hideTooltip();
  }
});

document.addEventListener("mouseout", (e) => {
  if (e.target === lastTarget) {
    hideTooltip();
  }
});

// ── Click to copy ─────────────────────────────────────────────────────

document.addEventListener("click", (e) => {
  const iconName = getIconName(e.target);
  if (!iconName) return;

  // Only copy when the tooltip is visible (i.e. the user is hovering an icon)
  if (!tooltip?.classList.contains("fa-id-tooltip--visible")) return;

  copyAndFlash(iconName);
});

// ── Right-click (context menu) message from background ────────────────

let lastRightClicked = null;

document.addEventListener("contextmenu", (e) => {
  lastRightClicked = e.target;
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "copyIconName" && lastRightClicked) {
    const iconName = getIconName(lastRightClicked);
    if (iconName) {
      copyAndFlash(iconName);
    } else {
      flashMessage("Not a Font Awesome icon");
    }
    lastRightClicked = null;
  }
});

// ── Helpers ───────────────────────────────────────────────────────────

function copyAndFlash(iconName) {
  copyToClipboard(iconName).then(() => {
    flashMessage(`Copied: ${iconName}`);
  });
}

function copyToClipboard(text) {
  // Try the modern API first
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  return fallbackCopy(text);
}

function fallbackCopy(text) {
  return new Promise((resolve, reject) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy") ? resolve() : reject();
    } catch {
      reject();
    } finally {
      document.body.removeChild(textarea);
    }
  });
}

function flashMessage(text) {
  const tip = ensureTooltip();
  tip.textContent = text;
  tip.classList.add("fa-id-tooltip--visible", "fa-id-tooltip--copied");
  setTimeout(() => {
    tip.classList.remove("fa-id-tooltip--copied");
    hideTooltip();
  }, 1200);
}
