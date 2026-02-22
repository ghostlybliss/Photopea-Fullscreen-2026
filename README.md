<div align="center">

<img src="https://www.photopea.com/promo/icon512.png" width="72" alt="Photopea"/>

# Photopea True Fullscreen

**Removes the gray ad sidebar on [Photopea.com](https://www.photopea.com)** Works with & without adblockers.

[![Version](https://img.shields.io/badge/version-1.0-00ff9d?style=flat-square&labelColor=111)](https://github.com/ghostlybliss/photopea-fullscreen)
[![License](https://img.shields.io/badge/license-MIT-00ff9d?style=flat-square&labelColor=111)](LICENSE)
[![Greasy Fork](https://img.shields.io/badge/Greasy%20Fork-install-00ff9d?style=flat-square&labelColor=111)](https://greasyfork.org)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-compatible-00ff9d?style=flat-square&labelColor=111)](https://www.tampermonkey.net)

</div>

---

## What it does

Photopea reserves a ~320px column on the right (sometimes left) for ads — even when you have an adblocker. This script uses a single `innerWidth` spoof to make Photopea think your window is wider than its sidebar threshold. It never allocates the space to begin with.

No CSS fighting. No MutationObserver loops. No synthetic resize events. One property override. That's it.

---

## Install

**Requirements:** [Tampermonkey](https://www.tampermonkey.net) or [Violentmonkey](https://violentmonkey.github.io)

### Option A — Direct install from GitHub
1. Make sure Tampermonkey is installed
2. [Click here to install](https://raw.githubusercontent.com/ghostlybliss/photopea-fullscreen/main/photopea-fullscreen.user.js) — Tampermonkey will prompt you to install it

### Option B — Greasy Fork *(recommended)*
> Coming soon — link will be added here after submission

### Option C — Manual
1. Tampermonkey → Dashboard → **+**
2. Paste the contents of [`photopea-fullscreen.user.js`](photopea-fullscreen.user.js)
3. Save → hard refresh Photopea (`Ctrl+Shift+R`)

---

## How it works

```js
Object.defineProperty(window, 'innerWidth', {
    get() { return document.documentElement.offsetWidth + 350; },
    configurable: true
});
