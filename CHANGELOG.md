# Changelog

Notable changes to **Photopea True Fullscreen** are documented here.

---

## [1.4.0] - 2026-09-03

### Changed

- Refocused the project entirely on fullscreen behavior.
- Removed the theme system, floating eye button, theme menu, saved theme preferences, and Photopea UI recoloring.
- Simplified the script so it interferes with as little of Photopea's interface as possible.
- Updated the width spoof to use a real viewport measurement plus a `320px` offset.
- Improved compatibility with Microsoft Edge and other Chromium-based browsers.

### Added

- Startup relayout checks to handle cases where Photopea calculates its layout before the spoof fully takes effect.
- Automatic layout recovery after:
  - switching back to the Photopea tab
  - refocusing the browser window
  - resizing the browser
  - changes to the visual viewport
- A lightweight watchdog that restores the `innerWidth` spoof if another script replaces it during a long session.
- Targeted suppression of Photopea's:
  - `"Something is changing our source code"`
  - `"Many features will not work correctly"`
  
  warning when it is triggered by the userscript.

### Removed

- All custom themes.
- Photopea panel color overrides.
- Theme-related CSS variables.
- The floating theme selector.
- Theme-related `localStorage`.
- Broad DOM / sidebar manipulation used by older experimental builds.

### Browser Testing

Confirmed working on:

- Microsoft Edge
- Brave

The script should also work with other modern browsers using Tampermonkey, Violentmonkey, or another compatible userscript manager.

---

## [1.2.1]

### Changed

- Simplified the fullscreen implementation around the `window.innerWidth` spoof.
- Re-applied the width spoof on `DOMContentLoaded` to reduce load-order issues.
- Kept the theme menu while removing more aggressive layout interference from earlier experiments.

---

## [1.2.0] - 2026-02-22

### Added

- Floating theme selector in the bottom-left corner.
- Four themes:
  - `SNOW`
  - `MIDNIGHT`
  - `DARK`
  - `MATRIX`
- Theme persistence through `localStorage`.
- Additional experiments aimed at improving Edge compatibility.
- Responsive styling for the theme menu.

### Changed

- Expanded the original width-spoof approach with additional layout and UI handling.
- Updated userscript metadata and Greasy Fork update URLs.

> These theme and UI features were later removed in v1.4.0 so the project could return to being a focused fullscreen utility.

---

## [1.1.9] - 2026-02-21

### Added

- Added the Photopea icon to the userscript metadata.

---

## [1.1.8] - 2026-02-21

### Changed

- Improved activation timing on cold loads and cached page loads.
- Reduced the need for manual hard-refreshing after installation.

---

## [1.1.7] - 2026-02-21

### Fixed

- Improved fullscreen behavior on Photopea's home screen.
- Reduced unnecessary DOM work that could interfere with image importing.

---

## [1.1.6] - 2026-02-21

### Changed

- Version bump with no major functional changes.

---

## [1.1.5] - 2026-02-21

### Fixed

- Reduced remaining right-edge spacing in the Photopea interface.

### Added

- Additional CSS experiments for tightening the editor layout.

---

## [1.1.4] - 2026-02-21

### Fixed

- Corrected repository and userscript metadata URLs to use:
  `Photopea-Fullscreen-2026`

---

## [1.1.3] - 2026-02-21

### Added

- Additional viewport spoofing experiments for Edge and Opera GX.
- Early-load enforcement intended to make the fullscreen behavior more reliable.

---

## [1.1.0] - 2026-02-21

### Changed

- Moved the userscript to `document-start` so the width spoof could run before Photopea's initial layout calculation.

### Added

- `DOMContentLoaded` reinforcement for reload reliability.

---

## [1.0.0] - 2026-02-21

### Added

- Initial release.
- Basic `window.innerWidth` spoof to prevent Photopea from reserving unused horizontal space.
- MIT License.
