<div align="center">
  <img src="https://www.photopea.com/promo/icon512.png" width="72" alt="Photopea"/>
  <h1>Photopea Fullscreen</h1>
  <p><strong>Enables Fullscreen on Photopea.com</strong><br>
  
  <a href="https://greasyfork.org/en/scripts/567062-photopea-true-fullscreen">
    <img src="https://img.shields.io/badge/Install_from-GreasyFork-0066cc?style=flat-square&logo=greasyfork&logoColor=white" alt="Install from Greasy Fork">
  </a>
  <a href="https://github.com/ghostlybliss/Photopea-Fullscreen-2026/releases">
    <img src="https://img.shields.io/badge/version-1.1.9-0066cc?style=flat-square&labelColor=111" alt="Version 1.1.9">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-0066cc?style=flat-square&labelColor=111" alt="MIT License">
  </a>
  <a href="https://www.tampermonkey.net">
    <img src="https://img.shields.io/badge/Tampermonkey-compatible-0066cc?style=flat-square&labelColor=111" alt="Tampermonkey compatible">
  </a>
</div>

---

![Photopea True Fullscreen](https://github.com/user-attachments/assets/9c3b7f8b-1581-460e-8009-8703dd12e0e6)

**Photopea reserves a ~320px column on the right (sometimes left) for ads — even when you have an adblocker.**  
This userscript prevents the space from ever being allocated by spoofing the browser width threshold.

No CSS overrides. No visual hacks. No layout flicker.

---

## Install

### Option 1 — One-Click (Recommended)
[![Install from Greasy Fork](https://img.shields.io/badge/Install_from-GreasyFork-0066cc?style=for-the-badge&logo=greasyfork&logoColor=white)](https://greasyfork.org/en/scripts/567062-photopea-true-fullscreen)

### Option 2 — Direct from GitHub
[Click here to install](https://raw.githubusercontent.com/ghostlybliss/Photopea-Fullscreen-2026/main/photopea-fullscreen.user.js)

### Option 3 — Manual
1. Open Tampermonkey / Violentmonkey  
2. Create a new script  
3. Paste `photopea-fullscreen.user.js`  
4. Save → hard refresh Photopea (`Ctrl + Shift + R`)

---

## How it works

Photopea checks your browser window width during initialization.  
If it detects a smaller viewport, it reserves space for advertising.

This script adjusts that value during load, ensuring the sidebar is never created.

The result is a clean, true fullscreen workspace with zero layout conflicts.

---

## Attribution & Disclaimer

[Photopea](https://www.photopea.com/) and its creator Ivan Kutskir own all rights to the Photopea service and branding.  
This project is an independent, unofficial userscript that modifies client-side behavior only. It is not affiliated with, endorsed by, or distributed by the original project.

If the owner or maintainers of Photopea have any concerns, please open an issue on this repository or contact me directly at `ghostlybliss@gmail.com`. Requests will be addressed promptly, including removal if requested.

If you enjoy Photopea, please support the original project by subscribing to Photopea's Premium membership.

---

## Source Code & Support

- Repository: https://github.com/ghostlybliss/Photopea-Fullscreen-2026  
- Issues: https://github.com/ghostlybliss/Photopea-Fullscreen-2026/issues  
- Greasy Fork: https://greasyfork.org/en/scripts/567062-photopea-true-fullscreen
