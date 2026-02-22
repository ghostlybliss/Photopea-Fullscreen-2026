# Changelog

All notable changes to **Photopea True Fullscreen** will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versions follow [Semantic Versioning](https://semver.org/).

---

## [1.2.0] - 2026-02-22
### Added
- **Themed UI — bottom-left eye bubble.** A fixed `44px` circular button sits in the bottom-left corner. Clicking it opens a compact floating menu above it listing all four themes with an accent-color dot and active-state highlight. Closes on outside click or `Escape`.
- **Four themes with full CSS variable system.** `SNOW` (green accent), `MIDNIGHT` (blue accent), `DARK` (orange accent), `MATRIX` (green-on-black). Each defines `--pp-bg`, `--pp-panel`, `--pp-accent`, `--pp-text`, `--pp-muted`, `--pp-border`, `--pp-shadow`. Theme is persisted via `localStorage` key `photopea_fullscreen_theme_v1`.
- **Sidebar hijacker (Edge fallback).** Secondary defensive layer targeting known ad sidebar selectors (`.right-panel.ads`, `.ad-sidebar`, `[class*="ad-"]`, etc.) and any element with suspicious ~320px width geometry. Runs on a 500ms interval and on DOM mutations via `MutationObserver`. Handles cases where the width spoof alone isn't enough (notably Microsoft Edge).
- **Aggressive spoof enforcement.** `innerWidth`, `outerWidth`, and `screen.width` are now re-applied every 150ms for the first 5 seconds (~33 iterations) after load, then recalculated every 1 second indefinitely. Catches Edge re-reading width after initial load.
- **Home screen label fixer.** `fixHomeLabels()` walks known home-screen containers (`.panelblock.home`, `.pp-launcher`, `.home-list`, etc.) and enforces `var(--pp-text)` color, opacity, and filter on nav labels, buttons, SVG icons, and images to prevent them from going invisible under dark theme backgrounds.
- **Responsive mobile layout.** `@media (max-width: 520px)` repositions the eye bubble and menu for narrow viewports.
- **Accessibility.** Eye button has `aria-label`, `role="button"`, keyboard (`Enter`/`Space`) support on all theme items, and `aria-hidden` toggling on the menu.
- **Console branding.** Styled `console.log` on init confirms version and build description.

### Changed
- `@description` updated to reflect Edge-optimized build with sidebar hijacker.
- `@downloadURL` and `@updateURL` now point to Greasy Fork CDN URLs directly instead of GitHub raw.
- Width spoof base now reads `document.documentElement.clientWidth || offsetWidth` at runtime instead of defaulting to a hardcoded `1920`.
- `dispatchEvent(new Event('resize'))` is now called after every spoof application (previously only on initial fire).
- MutationObserver for home label fixing uses `requestAnimationFrame` debounce via `scheduleFix()` instead of a raw 400ms `setTimeout` debounce — reduces jank during rapid DOM updates.
- Theme variables are applied directly to `document.documentElement` via `style.setProperty()` so they cascade globally without scoping issues.

### Removed
- Previous `Solar` and `Ghostly` themes replaced by `DARK` (orange) and `SNOW` (green) respectively with refined color palettes.
- Self-destroying 80ms interval enforcer from v1.1.3 replaced by the new 150ms/33-iteration aggressive enforcement loop.
- `DOMContentLoaded` safety net replaced by a `readyState` check + `DOMContentLoaded` listener combo that feeds into a single `init()` function via `requestAnimationFrame`.

---

## [1.1.9] - 2026-02-21
### Added
- `@icon` pointing to Photopea's official icon (`https://www.photopea.com/promo/icon512.png`) so the script displays a proper icon in the Tampermonkey/Violentmonkey menu.

---

## [1.1.8] - 2026-02-21
### Changed
- Script is now truly **set-and-forget** — no hard refresh (Ctrl+Shift+R) ever required after install or update.
- MutationObserver now watches `document.documentElement` directly and disconnects the moment `div.flexrow.app` is detected, ensuring the spoof fires at the earliest possible moment on every cold load.

### Removed
- `window.addEventListener('load')` safety net replaced by the instant DOM observer approach — load event was firing too late on cached loads.

---

## [1.1.7] - 2026-02-21
### Fixed
- Home-screen right-edge gray bar is now permanently suppressed (was only suppressed when editor was active).
- Image import lag caused by overly aggressive observer — debounce increased to 400ms.

### Changed
- Observer now uses a lightweight debounce pattern instead of firing on every mutation.

---

## [1.1.6] - 2026-02-21
### Changed
- Version bump only. No code changes from 1.1.5.

---

## [1.1.5] - 2026-02-21
### Fixed
- Right-edge gap (thin sliver next to Layers/History panel) fully closed.
- Left toolbar tightened from 6px to 2px padding for a pixel-perfect flush on 1440p.

### Added
- CSS rules to nuke `border-right`, `box-shadow`, `padding-right`, and `margin-right` on all right-edge panel elements.

---

## [1.1.4] - 2026-02-21
### Fixed
- All metadata URLs corrected from old repo name (`photopea-fullscreen`) to current repo (`Photopea-Fullscreen-2026`).
- `@homepageURL`, `@supportURL`, `@downloadURL`, `@updateURL` all updated.

---

## [1.1.3] - 2026-02-21
### Added
- `outerWidth` and `screen.width` spoofing in addition to `innerWidth` to cover edge cases on Opera GX and Microsoft Edge cold loads.
- Microtask spoof via `Promise.resolve().then(applySpoof)` for maximum early coverage.
- Self-destroying interval enforcer (fires every 80ms, clears itself after 1.2s).

---

## [1.1.0] - 2026-02-21
### Added
- `DOMContentLoaded` re-enforcement to fix intermittent gray sidebar on F5 soft refreshes.

### Changed
- Switched `@run-at` from `document-end` to `document-start` so the spoof is applied before Photopea's JS ever reads `innerWidth`.

---

## [1.0.0] - 2026-02-21
### Added
- Initial release. Core `innerWidth` spoof (+350px offset) to prevent Photopea from reserving ad sidebar space.
- Credits: collaborative debug session between Claude and Grok; community innerWidth trick originally documented ca. 2024; Photopea GitHub issues #7931, #8207, #8214, #8235.
- MIT License.
