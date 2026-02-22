<div align="center">

<img src="https://www.photopea.com/promo/icon512.png" width="72" alt="Photopea"/>

# Photopea True Fullscreen

**Removes the gray ad sidebar on [Photopea.com](https://www.photopea.com)**  
No crashes. No blank pages. No anti-tamper banners. Just the editor, edge to edge.

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

### Option A — Greasy Fork *(recommended)*
> Coming soon — link will be added here after submission

### Option B — Direct install from GitHub
1. Make sure Tampermonkey is installed
2. Click the link below — Tampermonkey will prompt you to install it

```
https://raw.githubusercontent.com/ghostlybliss/photopea-fullscreen/main/photopea-fullscreen.user.js
```

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
```

Photopea reads `window.innerWidth` on init to decide whether to render the ad sidebar. By spoofing it to be 350px wider than your actual viewport, the threshold check fails and the sidebar slot is never created — no gray gap left behind.

---

## Compatibility

| Browser | Status |
|---|---|
| Chrome / Edge | ✅ Confirmed working |
| Firefox | ✅ Confirmed working |
| Brave | ✅ Works (disable Shields for Photopea if banner appears) |
| Opera / Vivaldi | ✅ Should work |

**Tested:** February 21, 2026 — Photopea current build

---

## FAQ

**The sidebar is still there after install.**  
Hard refresh with `Ctrl+Shift+R`. If it persists, disable your adblocker on Photopea — some adblocker + userscript combos conflict.

**I see a "changing our source code" banner.**  
That's Photopea's anti-tamper check. It's cosmetic — the script still works. If it bothers you, temporarily disable Brave Shields / uBlock on the site.

**Does this work on Photopea project URLs (`photopea.com/#...`)?**  
Yes. The `@match` covers `photopea.com/*`.

**Will this break if Photopea updates?**  
The `innerWidth` read happens at app init and is a core part of Photopea's layout engine — it's been stable since at least 2024. If it ever breaks, a version bump will land here.

---

## Changelog

| Version | Date | Notes |
|---|---|---|
| 1.0 | Feb 21, 2026 | Initial release — minimal spoof approach |

---

## Credits

| Contributor | Role |
|---|---|
| **[ghostlybliss](https://github.com/ghostlybliss)** | Author, project owner, testing |
| **Claude** (Anthropic) | Script architecture, selector logic, iteration v2.1–v2.9, crash diagnosis |
| **Grok** (xAI) | A/B ad placement research, nth-child(3) catch, stealth mode revisions |
| **Greasy Fork community** | Original `innerWidth` trick documentation (ca. 2024) |
| **Photopea GitHub community** | Issues [#7931](https://github.com/nicktacular/photopea/issues/7931), [#8207](https://github.com/nicktacular/photopea/issues/8207), [#8214](https://github.com/nicktacular/photopea/issues/8214), [#8235](https://github.com/nicktacular/photopea/issues/8235) — reports that informed the research |

> This script was built through a collaborative debug session between Claude (Anthropic) and Grok (xAI) on February 21, 2026 — iterating from v2.0 to v2.9 before landing on the minimal v1.0 approach that actually works.

---

## License

[MIT](LICENSE) © 2026 ghostlybliss
