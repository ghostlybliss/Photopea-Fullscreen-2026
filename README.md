<div align="center">
  <img src="https://www.photopea.com/promo/icon512.png" width="72" alt="Photopea"/>

  <h1>Photopea True Fullscreen</h1>

  <p><strong>Let Photopea use the whole damn window.</strong></p>

  <a href="https://greasyfork.org/en/scripts/567062-photopea-true-fullscreen">
    <img src="https://img.shields.io/badge/Install_from-GreasyFork-0066cc?style=flat-square&logo=greasyfork&logoColor=white" alt="Install from Greasy Fork">
  </a>

  <a href="https://github.com/ghostlybliss/Photopea-Fullscreen-2026/releases">
    <img src="https://img.shields.io/badge/version-1.4.0-0066cc?style=flat-square&labelColor=111" alt="Version 1.4.0">
  </a>

  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-0066cc?style=flat-square&labelColor=111" alt="MIT License">
  </a>

  <a href="https://www.tampermonkey.net">
    <img src="https://img.shields.io/badge/Tampermonkey-compatible-0066cc?style=flat-square&labelColor=111" alt="Tampermonkey compatible">
  </a>
</div>

---

![Photopea True Fullscreen](photopea-fullscreen.png)

Photopea can reserve a large empty section on the right side of the window.

This userscript makes Photopea use that space instead.

There is little reason to surrender perfectly good screen space to nothing.

---

## Features

- Full-width Photopea workspace
- Removes the reserved area on the right
- Tested on Microsoft Edge and Brave
- Re-applies the layout after tab switching, refocusing, and resizing
- Keeps the width spoof active during long sessions
- Hides Photopea's specific `"Something is changing our source code"` warning when triggered by the script
- No themes
- No UI recoloring
- No external libraries

---

## Install

### Greasy Fork

[![Install from Greasy Fork](https://img.shields.io/badge/Install_from-GreasyFork-0066cc?style=for-the-badge&logo=greasyfork&logoColor=white)](https://greasyfork.org/en/scripts/567062-photopea-true-fullscreen)

### GitHub

[Install the latest userscript](https://raw.githubusercontent.com/ghostlybliss/Photopea-Fullscreen-2026/main/photopea-fullscreen.user.js)

### Manual

1. Install Tampermonkey or Violentmonkey
2. Create a new userscript
3. Paste in `photopea-fullscreen.user.js`
4. Save
5. Open Photopea

---

## How It Works

Photopea checks the browser width when deciding how much horizontal space to reserve.

This script changes the value Photopea sees through `window.innerWidth`, so the workspace is laid out across the full visible window.

The basic idea is:

```js
Object.defineProperty(window, 'innerWidth', {
    get() {
        return realViewportWidth + 320;
    },
    configurable: true
});
