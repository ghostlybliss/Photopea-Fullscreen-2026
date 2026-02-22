// ==UserScript==
// @name         Photopea True Fullscreen
// @namespace    https://github.com/ghostlybliss
// @version      1.1.6
// @description  Removes gray ad sidebar + zero right-edge gap + tighter left toolbar (2px flush). Pixel-perfect on 1440p (Feb 21 2026)
// @author       ghostlybliss
// @match        https://www.photopea.com/*
// @match        https://photopea.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// @homepageURL  https://github.com/ghostlybliss/Photopea-Fullscreen-2026
// @supportURL   https://github.com/ghostlybliss/Photopea-Fullscreen-2026/issues
// @downloadURL  https://raw.githubusercontent.com/ghostlybliss/Photopea-Fullscreen-2026/main/photopea-fullscreen.user.js
// @updateURL    https://raw.githubusercontent.com/ghostlybliss/Photopea-Fullscreen-2026/main/photopea-fullscreen.user.js
// ==/UserScript==

(function () {
    'use strict';

    const SPOOF_ADD = 280;

    function applySpoof() {
        const spoofed = (document.documentElement?.clientWidth ?? document.documentElement?.offsetWidth ?? 1920) + SPOOF_ADD;
        Object.defineProperty(window, 'innerWidth', { get: () => spoofed, configurable: true });
        Object.defineProperty(window, 'outerWidth', { get: () => spoofed + 60, configurable: true });
        if (window.screen) Object.defineProperty(window.screen, 'width', { get: () => spoofed, configurable: true });
    }

    // MAX EARLY SPOOF
    applySpoof();
    Promise.resolve().then(applySpoof);
    requestAnimationFrame(applySpoof);
    setTimeout(applySpoof, 0);
    setTimeout(applySpoof, 1);
    setTimeout(applySpoof, 5);

    const appObserver = new MutationObserver(() => {
        if (document.querySelector('div.flexrow.app')) {
            applySpoof();
            setTimeout(() => window.dispatchEvent(new Event('resize')), 10);
            appObserver.disconnect();
        }
    });
    appObserver.observe(document.documentElement, { childList: true, subtree: true });

    window.addEventListener('load', () => {
        applySpoof();
        setTimeout(() => window.dispatchEvent(new Event('resize')), 30);
    }, { once: true });

    // ────── PIXEL-PERFECT CSS (right flush + left now 2px tight) ──────
    const css = document.createElement('style');
    css.textContent = `
        /* Kill gray sidebar */
        body > div.flexrow.app:has(.panelblock.mainblock) > div:nth-child(n+2) {
            display: none !important;
            width: 0 !important; min-width: 0 !important; flex: 0 0 0 !important;
        }
        /* Main canvas full width */
        body > div.flexrow.app:has(.panelblock.mainblock) > div:first-child,
        body > div.flexrow.app:has(.panelblock.mainblock) > div:first-child > div.flexrow > div.panelblock.mainblock {
            flex: 1 1 auto !important; min-width: 0 !important;
        }
        /* LEFT TOOLBAR — tightened to 2px (your yellow highlight area now perfect) */
        body > div.flexrow.app:has(.panelblock.mainblock) { padding-left: 2px !important; }
        .left-panel, .tools-panel { min-width: 72px !important; flex-shrink: 0 !important; }
        /* Home screen clean */
        body > div.flexrow.app:not(:has(.panelblock.mainblock)) { padding-left: 0 !important; }

        /* RIGHT EDGE 100% FLUSH */
        body > div.flexrow.app,
        body > div.flexrow.app > div:last-child,
        .right-panel,
        [class*="panel"]:last-child {
            padding-right: 0 !important;
            margin-right: 0 !important;
            border-right: none !important;
            box-shadow: none !important;
        }
        body > div.flexrow.app > div:last-child > * {
            border-right: none !important;
            box-shadow: none !important;
        }

        .flexrow.app { overflow: hidden !important; }
    `;
    (document.head || document.documentElement).appendChild(css);

    // Light observer
    let t;
    const obs = new MutationObserver(() => { clearTimeout(t); t = setTimeout(applySpoof, 400); });
    obs.observe(document.body, { childList: true, subtree: true });

    console.log('%c[ghostlybliss] Photopea True Fullscreen v1.1.6 — left toolbar now 2px tight + right flush ✅', 'color:#00ff9d;font-weight:bold;');
})();
