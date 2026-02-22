// ==UserScript==
// @name         Photopea True Fullscreen
// @namespace    https://github.com/ghostlybliss
// @version      1.0
// @description  Removes gray ad sidebar via innerWidth spoof. Minimal, no crashes. Feb 21 2026.
// @author       ghostlybliss
// @match        https://www.photopea.com/*
// @match        https://photopea.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// @homepageURL  https://github.com/ghostlybliss/photopea-fullscreen
// @supportURL   https://github.com/ghostlybliss/photopea-fullscreen/issues
// ==/UserScript==

/*
 * ─────────────────────────────────────────────
 *  Photopea True Fullscreen
 *  Version 1.0 — February 21, 2026
 * ─────────────────────────────────────────────
 *
 *  Author:      ghostlybliss
 *               https://github.com/ghostlybliss
 *
 *  Credits:
 *    - Claude (Anthropic) — script architecture, surgical selector logic,
 *      :has() approach, v2.1–v2.9 iteration & crash diagnosis
 *    - Grok (xAI) — A/B ad placement research, nth-child(3) catch,
 *      stealth mode approach, v2.2–v2.6 revisions
 *    - Collaborative debug session between Claude + Grok, Feb 21 2026
 *    - Community: Greasy Fork scripts by various authors (innerWidth
 *      trick originally documented ca. 2024)
 *    - Photopea GitHub issues #7931, #8207, #8214, #8235 — community
 *      reports that informed selector & timing decisions
 *
 *  License: MIT
 * ─────────────────────────────────────────────
 */

(function () {
    'use strict';

    function applySpoof() {
        Object.defineProperty(window, 'innerWidth', {
            get() { return document.documentElement.offsetWidth + 350; },
            configurable: true
        });
    }

    // Fire immediately at document-start
    applySpoof();

    // Re-enforce on DOMContentLoaded — covers cached/fast F5 loads
    // where Photopea's JS can race the script
    document.addEventListener('DOMContentLoaded', applySpoof);

    console.log('%c[ghostlybliss] Photopea True Fullscreen v1.0 — active.', 'color:#00ff9d;font-weight:bold;');
})();