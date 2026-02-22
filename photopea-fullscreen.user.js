// ==UserScript==
// @name         Photopea True Fullscreen
// @namespace    https://github.com/ghostlybliss
// @version      1.1.8
// @description  Photopea fullscreen + theme engine.
// @author       ghostlybliss
// @match        https://www.photopea.com/*
// @match        https://photopea.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    /* =========================
       CONFIG + THEMES
    ========================== */
    const SPOOF_ADD = 280;
    const THEME_KEY = 'photopea_fullscreen_theme_v1';
    const THEMES = [
        { id: 'ghostly',  name: 'Ghostly',  vars: { '--pp-bg':'#0b0f10','--pp-panel':'#0f1415','--pp-accent':'#00ff9d','--pp-text':'#e6f6f0','--pp-muted':'#9ab6ac','--pp-border':'rgba(0,0,0,0.4)','--pp-shadow':'0 6px 24px rgba(0,0,0,0.6)'} },
        { id: 'midnight', name: 'Midnight', vars: { '--pp-bg':'#0a0c11','--pp-panel':'#0f1720','--pp-accent':'#6ea8fe','--pp-text':'#dbe9ff','--pp-muted':'#94a3b8','--pp-border':'rgba(255,255,255,0.04)','--pp-shadow':'0 6px 24px rgba(2,6,23,0.75)'} },
        // Solar: text forced to white for maximum legibility (per request)
        { id: 'solar',   name: 'Solar',   vars: {
            '--pp-bg':'#fffaf5',
            '--pp-panel':'#fff8ef',
            '--pp-accent':'#b58900',
            '--pp-text':'#ffffff',    /* <-- WHITE FOR READABILITY */
            '--pp-muted':'#e6d8b8',
            '--pp-border':'rgba(0,0,0,0.06)',
            '--pp-shadow':'0 6px 24px rgba(0,0,0,0.06)'
        } },
        { id: 'matrix',  name: 'Matrix',  vars: { '--pp-bg':'#020200','--pp-panel':'#03110a','--pp-accent':'#19ff08','--pp-text':'#a8ffb7','--pp-muted':'#4b8a4b','--pp-border':'rgba(0,255,0,0.06)','--pp-shadow':'0 6px 30px rgba(0,0,0,0.7)'} }
    ];

    function getSavedThemeId() { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } }
    function saveThemeId(id) { try { localStorage.setItem(THEME_KEY, id); } catch (e) {} }
    function findThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
    function applyTheme(theme) {
        const root = document.documentElement;
        Object.entries(theme.vars).forEach(([k,v]) => root.style.setProperty(k, v));
        root.setAttribute('data-pp-theme', theme.id);
    }

    /* =========================
       WIDTH SPOOFING (define once)
    ========================== */
    let baseWidth = 1920; // fallback

    function calculateBaseWidth() {
        const d = document.documentElement;
        if (!d) return baseWidth;
        return d.clientWidth || d.offsetWidth || baseWidth;
    }

    function updateBaseWidth() {
        baseWidth = calculateBaseWidth();
        try { window.dispatchEvent(new Event('resize')); } catch (e) {}
    }

    try {
        Object.defineProperty(window, 'innerWidth', { get: () => baseWidth + SPOOF_ADD, configurable: true });
        Object.defineProperty(window, 'outerWidth', { get: () => baseWidth + SPOOF_ADD + 60, configurable: true });
        if (window.screen) Object.defineProperty(window.screen, 'width', { get: () => baseWidth + SPOOF_ADD, configurable: true });
    } catch (e) {
        console.warn('[ghostlybliss] Width spoof definition failed:', e);
    }

    updateBaseWidth();
    requestAnimationFrame(updateBaseWidth);

    /* App observer (single-run) */
    const appObserver = new MutationObserver((_, observer) => {
        if (document.querySelector('div.flexrow.app')) {
            updateBaseWidth();
            setTimeout(updateBaseWidth, 25);
            observer.disconnect();
        }
    });
    appObserver.observe(document.documentElement, { childList: true, subtree: true });

    /* Lightweight body observer (debounced) */
    let debounceTimer;
    (function startBodyObserver() {
        if (!document.body) { requestAnimationFrame(startBodyObserver); return; }
        const bodyObserver = new MutationObserver(() => { clearTimeout(debounceTimer); debounceTimer = setTimeout(updateBaseWidth, 300); });
        bodyObserver.observe(document.body, { childList: true, subtree: true });
    })();

    /* =========================
       CSS: core + toggle (bounce in/out & label fixes)
    ========================== */
    const css = document.createElement('style');
    css.textContent = `
        :root {
            --pp-toggle-size: clamp(36px, 2.2vw, 56px);
            --pp-toggle-height: calc(var(--pp-toggle-size) * 1.14);
            --pp-toggle-gap: clamp(10px, 1.8vh, 18px);
            --pp-toggle-hide-offset: calc(var(--pp-toggle-size) * 0.78);
            --pp-activation-radius: clamp(90px, 8vw, 160px);
            --pp-collapsed-x: calc(-1 * var(--pp-toggle-hide-offset));
        }

        /* theme defaults (JS will overwrite) */
        :root { --pp-bg:#0b0f10; --pp-panel:#0f1415; --pp-accent:#00ff9d; --pp-text:#e6f6f0; --pp-muted:#9ab6ac; }

        /* non-destructive Photopea tweaks */
        body, html, .flexrow.app { background: var(--pp-bg) !important; color: var(--pp-text) !important; }
        .panelblock, .left-panel, .right-panel, .tools-panel { background: var(--pp-panel) !important; color: var(--pp-text) !important; }

        /* hide gray sidebar when editor active */
        body > div.flexrow.app:has(.panelblock.mainblock) > div:nth-child(n+2) {
            display: none !important;
            width: 0 !important;
            min-width: 0 !important;
            flex: 0 0 0 !important;
        }

        /* expand main canvas */
        body > div.flexrow.app:has(.panelblock.mainblock) > div:first-child,
        body > div.flexrow.app:has(.panelblock.mainblock) .panelblock.mainblock {
            flex: 1 1 auto !important;
            min-width: 0 !important;
            background: transparent !important;
        }

        /* fallbacks for non-:has browsers */
        .right-panel, .ad-panel, .panel-ad, [class*="ad"] {
            padding-right: 0 !important;
            margin-right: 0 !important;
            border-right: none !important;
            box-shadow: none !important;
            max-width: none !important;
        }

        /* -------------------------
           Toggle: anchored bottom-left, uses transform animations
           Width expands to fit label (no clipping)
           ------------------------- */
        #pp-theme-toggle {
            position: fixed;
            left: var(--pp-toggle-gap);
            bottom: var(--pp-toggle-gap);
            z-index: 2147483646 !important;

            height: var(--pp-toggle-height);
            min-width: var(--pp-toggle-size);
            max-width: clamp(160px, 32vw, 520px); /* allow full label display on large screens */
            padding: 6px 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;

            background: var(--pp-panel);
            color: var(--pp-text);
            border-radius: calc(var(--pp-toggle-height) / 2);
            border: 1px solid rgba(255,255,255,0.04);
            box-shadow: 0 8px 26px rgba(0,0,0,0.48);
            cursor: pointer;
            user-select: none;
            -webkit-tap-highlight-color: transparent;

            transform: translateX(var(--pp-collapsed-x));
            transition: opacity 140ms ease;
            overflow: visible; /* crucial so label isn't clipped */
            white-space: nowrap;
        }

        /* collapsed: only arrow area visible (transform hides the rest) */
        #pp-theme-toggle.collapsed { transform: translateX(var(--pp-collapsed-x)); width: var(--pp-toggle-size); padding-left: 8px; padding-right: 8px; }

        /* expanded: full width available for label */
        #pp-theme-toggle.expanded { transform: translateX(0); width: auto; padding-left: 12px; padding-right: 16px; }

        /* bounce-out (expand) animation */
        @keyframes ppBounceOut {
            0%   { transform: translateX(var(--pp-collapsed-x)); }
            55%  { transform: translateX(calc(6%)); }
            80%  { transform: translateX(calc(-3%)); }
            100% { transform: translateX(0); }
        }

        /* bounce-in (collapse) animation */
        @keyframes ppBounceIn {
            0%   { transform: translateX(0); }
            50%  { transform: translateX(calc(3%)); }
            100% { transform: translateX(var(--pp-collapsed-x)); }
        }

        /* classes that get animations applied from JS */
        #pp-theme-toggle.anim-out { animation: ppBounceOut 520ms cubic-bezier(.2,.8,.25,1); }
        #pp-theme-toggle.anim-in  { animation: ppBounceIn 420ms cubic-bezier(.4,0,.2,1); }

        /* svg arrow and label */
        #pp-theme-toggle svg { width: calc(var(--pp-toggle-size) * 0.56); height: calc(var(--pp-toggle-size) * 0.56); display:block; flex-shrink:0; }
        #pp-theme-toggle .label {
            display: inline-block;
            font-weight: 600;
            font-size: 13px;
            color: var(--pp-muted);
            opacity: 0;
            transform: translateX(0);
            transition: opacity 160ms ease;
            white-space: nowrap;
        }
        #pp-theme-toggle.expanded .label { opacity: 1; }

        /* subtle pulse while collapsed */
        #pp-theme-toggle.collapsed .pulse { animation: ppPulse 2.6s infinite; opacity:0.85; }
        @keyframes ppPulse { 0%{ transform: translateX(0) scale(1); } 50%{ transform: translateX(1px) scale(1.02); } 100%{ transform: translateX(0) scale(1); } }

        /* quick menu */
        #pp-theme-menu { position: fixed; min-width: 160px; border-radius:8px; padding:6px; background:var(--pp-panel); color:var(--pp-text); box-shadow:0 8px 30px rgba(0,0,0,0.5); border:1px solid rgba(0,0,0,0.12); z-index:2147483647; font:13px/1 system-ui, -apple-system, "Segoe UI", Roboto, Arial; }
        #pp-theme-menu > div { padding:8px 10px; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:8px; }
        #pp-theme-menu > div:hover { background: rgba(255,255,255,0.02); }
    `;
    (document.head || document.documentElement).appendChild(css);

    /* =========================
       UI: create toggle + quick menu + label management
    ========================== */
    function createToggle() {
        const existing = document.getElementById('pp-theme-toggle');
        if (existing) return existing;

        const btn = document.createElement('button');
        btn.id = 'pp-theme-toggle';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Photopea theme toggle');
        btn.classList.add('collapsed');

        btn.innerHTML = `
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="pulse">
                <path d="M8.5 5.5 L15 12 L8.5 18.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <span class="label"></span>
        `;

        btn.addEventListener('click', () => {
            const curId = getSavedThemeId() || THEMES[0].id;
            const idx = Math.max(0, THEMES.findIndex(t => t.id === curId));
            const next = THEMES[(idx + 1) % THEMES.length];
            applyTheme(next);
            saveThemeId(next.id);
            refreshToggleLabel(next.name);
        }, { passive: true });

        btn.addEventListener('contextmenu', (ev) => {
            ev.preventDefault();
            showQuickMenu(ev.clientX, ev.clientY);
        });

        btn.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); btn.click(); }
        });

        document.documentElement.appendChild(btn);
        refreshToggleLabel(findThemeById(getSavedThemeId()).name);
        return btn;
    }

    function refreshToggleLabel(name) {
        const label = document.querySelector('#pp-theme-toggle .label');
        if (label) label.textContent = name;
    }

    function showQuickMenu(x, y) {
        const old = document.getElementById('pp-theme-menu'); if (old) old.remove();
        const menu = document.createElement('div'); menu.id = 'pp-theme-menu';
        const safeX = Math.max(6, Math.min(x, window.innerWidth - 180));
        const safeY = Math.max(6, Math.min(y, window.innerHeight - 300));
        menu.style.left = `${safeX}px`; menu.style.top = `${safeY}px`;

        THEMES.forEach(t => {
            const item = document.createElement('div');
            item.textContent = t.name;
            const dot = document.createElement('span');
            dot.style.width = '12px'; dot.style.height = '12px'; dot.style.borderRadius = '50%'; dot.style.background = t.vars['--pp-accent'];
            item.appendChild(dot);
            item.addEventListener('click', () => { applyTheme(t); saveThemeId(t.id); refreshToggleLabel(t.name); menu.remove(); }, { passive: true });
            menu.appendChild(item);
        });

        function removeMenu() { menu.remove(); document.removeEventListener('mousedown', removeMenu); document.removeEventListener('scroll', removeMenu, true); }
        document.addEventListener('mousedown', removeMenu);
        document.addEventListener('scroll', removeMenu, true);
        document.documentElement.appendChild(menu);
    }

    /* =========================
       PROXIMITY + HOVER + BOUNCE LOGIC (robust)
    ========================== */
    let toggleEl = null;
    let hideTimeout = null;
    let proxActive = false;
    const HIDE_DELAY = 900;

    function ensureToggle() { if (!toggleEl) toggleEl = createToggle(); return toggleEl; }

    function animateOutOnce(el) {
        if (!el) return;
        el.classList.remove('anim-in');
        // force reflow to restart animation if needed
        void el.offsetWidth;
        el.classList.add('anim-out');
        const onEnd = () => {
            el.classList.remove('anim-out');
            el.removeEventListener('animationend', onEnd);
        };
        el.addEventListener('animationend', onEnd);
        // safety cleanup
        setTimeout(() => { el.classList.remove('anim-out'); }, 700);
    }

    function animateInOnce(el, cb) {
        if (!el) { if (cb) cb(); return; }
        el.classList.remove('anim-out');
        void el.offsetWidth;
        el.classList.add('anim-in');
        const onEnd = () => {
            el.classList.remove('anim-in');
            el.removeEventListener('animationend', onEnd);
            if (cb) cb();
        };
        el.addEventListener('animationend', onEnd);
        // safety fallback
        setTimeout(() => { el.classList.remove('anim-in'); if (cb) cb(); }, 600);
    }

    function showToggleTemporary() {
        const t = ensureToggle();
        if (!t) return;
        const wasCollapsed = t.classList.contains('collapsed');

        // make expanded now (label visible)
        t.classList.remove('collapsed');
        t.classList.add('expanded');

        // remove pulse
        t.querySelector('svg')?.classList.remove('pulse');

        if (wasCollapsed) {
            animateOutOnce(t);
        }

        clearTimeout(hideTimeout);
    }

    function hideToggleIfAllowed() {
        const t = ensureToggle();
        if (!t) return;
        if (t.matches(':hover') || proxActive) return;

        // animate collapse, then set collapsed class after animation completes
        animateInOnce(t, () => {
            t.classList.remove('expanded');
            t.classList.add('collapsed');
            // restore pulse
            t.querySelector('svg')?.classList.add('pulse');
        });
    }

    function scheduleHide() {
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => { hideToggleIfAllowed(); }, HIDE_DELAY);
    }

    function handleMouseMove(e) {
        ensureToggle();
        const vw = window.innerWidth, vh = window.innerHeight;
        const bottomGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pp-toggle-gap')) || 12;
        const anchorX = 0;
        const anchorY = vh - bottomGap;
        const dx = e.clientX - anchorX;
        const dy = e.clientY - anchorY;
        const dist = Math.hypot(dx, dy);
        const activation = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pp-activation-radius')) || Math.min(140, Math.max(90, vw * 0.08));
        const nearLeftEdge = (e.clientX <= Math.max(36, Math.min(80, vw * 0.03)));
        if (dist <= activation || nearLeftEdge) {
            proxActive = true;
            showToggleTemporary();
        } else {
            proxActive = false;
            scheduleHide();
        }
    }

    function handleMouseEnter() { proxActive = true; showToggleTemporary(); }
    function handleMouseLeave() { proxActive = false; scheduleHide(); }

    function attachProximityListeners() {
        ensureToggle();
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        const t = document.getElementById('pp-theme-toggle');
        if (t) { t.addEventListener('mouseenter', handleMouseEnter, { passive: true }); t.addEventListener('mouseleave', handleMouseLeave, { passive: true }); }
    }

    /* =========================
       INIT
    ========================== */
    (function init() {
        const savedId = getSavedThemeId();
        const theme = findThemeById(savedId || THEMES[0].id);
        applyTheme(theme);

        requestAnimationFrame(() => {
            createToggle();
            attachProximityListeners();
            const t = document.getElementById('pp-theme-toggle');
            if (t) { t.classList.add('collapsed'); t.querySelector('svg')?.classList.add('pulse'); }
        });
    })();

    console.log('%c[ghostlybliss] Photopea True Fullscreen v1.1.8 — Solar text set to WHITE; menu fixed.', 'color:#00ff9d;font-weight:bold;');
})();
