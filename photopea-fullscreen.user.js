// ==UserScript==
// @name        Photopea True Fullscreen
// @namespace   https://github.com/ghostlybliss
// @version     1.2.0
// @description Compact theme menu below; Edge-optimized with aggressive width spoof + sidebar hijacker.
// @author      ghostlybliss
// @match       https://www.photopea.com/*
// @match       https://photopea.com/*
// @run-at      document-start
// @grant       none
// @license     MIT
// @icon        https://www.photopea.com/promo/icon512.png
// ==/UserScript==

(function () {
  'use strict';

  /* ========================= CONFIG ========================== */
  const SPOOF_ADD = 280;
  const THEME_KEY = 'photopea_fullscreen_theme_v1';
  const HIDE_DELAY = 2000;

  const THEMES = [
    { id: 'snow', name: 'SNOW', vars: { '--pp-bg': '#0b0f10', '--pp-panel': '#0f1415', '--pp-accent': '#00ff9d', '--pp-text': '#e6f6f0', '--pp-muted': '#9ab6ac', '--pp-border': 'rgba(0,0,0,0.4)', '--pp-shadow': '0 6px 24px rgba(0,0,0,0.6)' } },
    { id: 'midnight', name: 'MIDNIGHT', vars: { '--pp-bg': '#0a0c11', '--pp-panel': '#0f1720', '--pp-accent': '#6ea8fe', '--pp-text': '#dbe9ff', '--pp-muted': '#94a3b8', '--pp-border': 'rgba(255,255,255,0.04)', '--pp-shadow': '0 6px 24px rgba(2,6,23,0.75)' } },
    { id: 'dark', name: 'DARK', vars: { '--pp-bg': '#07090c', '--pp-panel': '#11151a', '--pp-accent': '#ff7a00', '--pp-text': '#eaf6ff', '--pp-muted': '#7f95a6', '--pp-border': 'rgba(0,255,255,0.06)', '--pp-shadow': '0 8px 40px rgba(0,0,0,0.85)' } },
    { id: 'matrix', name: 'MATRIX', vars: { '--pp-bg': '#020200', '--pp-panel': '#03110a', '--pp-accent': '#19ff08', '--pp-text': '#a8ffb7', '--pp-muted': '#4b8a4b', '--pp-border': 'rgba(0,255,0,0.06)', '--pp-shadow': '0 6px 30px rgba(0,0,0,0.7)' } }
  ];

  /* ========================= THEME HELPERS ========================== */
  function getSavedThemeId() { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } }
  function saveThemeId(id) { try { localStorage.setItem(THEME_KEY, id); } catch (e) {} }
  function findThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
  function applyTheme(theme) {
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute('data-ptf-theme', theme.id);
    updateMenuActive(theme.id);
  }

  /* ========================= WIDTH SPOOF (EDGE-OPTIMIZED) ========================== */
  let baseWidth = 1920;
  let spoofIntervalId = null;

  function calculateBaseWidth() {
    const d = document.documentElement;
    return (d && (d.clientWidth || d.offsetWidth)) || baseWidth;
  }

  function applySpoofImmediately() {
    baseWidth = calculateBaseWidth();
    try {
      Object.defineProperty(window, 'innerWidth', {
        get: () => baseWidth + SPOOF_ADD,
        configurable: true
      });
      Object.defineProperty(window, 'outerWidth', {
        get: () => baseWidth + SPOOF_ADD + 60,
        configurable: true
      });
      if (window.screen) {
        Object.defineProperty(window.screen, 'width', {
          get: () => baseWidth + SPOOF_ADD,
          configurable: true
        });
      }
    } catch (e) {
      console.warn('[ptf] width spoof failed', e);
    }
    try {
      window.dispatchEvent(new Event('resize'));
    } catch (e) {}
  }

  // AGGRESSIVE ENFORCEMENT: Re-apply spoof every 150ms for first 5 seconds
  // This catches Edge trying to re-read the width after page load
  function enforceAggressiveSpoof() {
    applySpoofImmediately();
    let attempts = 0;
    spoofIntervalId = setInterval(() => {
      attempts++;
      applySpoofImmediately();
      if (attempts >= 33) {
        clearInterval(spoofIntervalId);
        spoofIntervalId = null;
      }
    }, 150);
  }

  // Fallback: periodic re-enforcement after aggressive phase
  function enforceLongTermSpoof() {
    setInterval(() => {
      baseWidth = calculateBaseWidth();
    }, 1000);
  }

  applySpoofImmediately();
  enforceAggressiveSpoof();
  enforceLongTermSpoof();

  /* ========================= SIDEBAR HIJACKER (EDGE FALLBACK) ========================== */
  // If Photopea still creates a sidebar despite width spoof, this will remove it
  const SIDEBAR_SELECTORS = ['.right-panel.ads', '.right-ad-panel', '.ad-sidebar', '[class*="ad-"]', '.sidebar-ads'];
  const MONITORED_CONTAINERS = ['.flexrow.app', '.pp-app', 'body', 'html'];
  const removedSidebars = new Set();

  function removeSidebar() {
    let removed = false;
    for (const sel of SIDEBAR_SELECTORS) {
      document.querySelectorAll(sel).forEach(el => {
        if (!removedSidebars.has(el)) {
          try {
            el.style.display = 'none !important';
            el.remove && el.remove();
            removedSidebars.add(el);
            removed = true;
            console.log('[ptf] removed ad sidebar element:', sel);
          } catch (e) {}
        }
      });
    }

    // Also check for any elements with suspicious sizing (320px width = typical ad space)
    const allEls = document.querySelectorAll('[style*="width: 320"], [style*="width:320"], [style*="flex-basis: 320"], [style*="min-width: 320"]');
    allEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 300 && rect.width < 340 && (rect.right === rect.width || rect.left === window.innerWidth - rect.width)) {
        if (!removedSidebars.has(el)) {
          try {
            el.style.display = 'none !important';
            removedSidebars.add(el);
            removed = true;
            console.log('[ptf] removed suspicious sidebar:', el);
          } catch (e) {}
        }
      }
    });

    return removed;
  }

  // Run sidebar removal on a schedule
  const sidebarCheckId = setInterval(() => {
    removeSidebar();
  }, 500);

  // Also listen for DOM changes and check immediately
  const sidebarObserver = new MutationObserver(() => {
    removeSidebar();
  });

  function startSidebarWatcher() {
    try {
      sidebarObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    } catch (e) {}
  }

  // Run initial sidebar removal
  removeSidebar();
  setTimeout(removeSidebar, 100);
  setTimeout(removeSidebar, 300);
  setTimeout(removeSidebar, 800);
  setTimeout(() => { startSidebarWatcher(); removeSidebar(); }, 1000);

  /* ========================= STYLES (bottom-left eye & compact menu) ========================== */
  const css = `
:root{ --bubble-size:44px; --bubble-gap:14px; --menu-minw:170px; }

/* theme variables overwritten by JS */
body, html, .flexrow.app { background: var(--pp-bg) !important; color: var(--pp-text) !important; }
.panelblock, .left-panel, .right-panel, .tools-panel, .topbar, .toolbar {
  background: var(--pp-panel) !important; color: var(--pp-text) !important; border-color: var(--pp-border) !important;
  box-shadow: var(--pp-shadow) !important;
}

/* Keep launcher/home labels readable - targeted */
.panelblock.home, .pp-launcher, .home-list, .file-source-panel, .left-panel { color: var(--pp-text) !important; }
.panelblock.home img, .panelblock.home svg, .home-list img, .home-list svg { opacity:1 !important; filter:none !important; }

/* Bottom-left bubble (eye) */
#ptf-bubble-eye{position:fixed;left:var(--bubble-gap);bottom:var(--bubble-gap);z-index:2147483648;width:var(--bubble-size);height:var(--bubble-size);border-radius:999px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;background:linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02));border:1px solid rgba(255,255,255,0.04);box-shadow:0 14px 40px rgba(0,0,0,0.5),0 1px 0 rgba(255,255,255,0.03) inset;transition:transform .16s,box-shadow .16s;backdrop-filter: blur(4px); }
#ptf-bubble-eye:hover{transform: translateY(-3px) scale(1.03); box-shadow:0 18px 48px rgba(0,0,0,0.55);}
#ptf-bubble-eye svg{width:22px;height:22px;stroke:var(--pp-text);fill:none;stroke-width:1.6;}

/* Compact menu (appears above eye) */
#ptf-bubble-menu{position:fixed;left:var(--bubble-gap);bottom:calc(var(--bubble-gap) + var(--bubble-size) + 8px);z-index:2147483648;min-width:var(--menu-minw);border-radius:14px;padding:8px;background:linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.04);box-shadow:0 22px 60px rgba(0,0,0,0.6);transform-origin:left bottom;opacity:0;transform:scale(.98) translateY(6px);pointer-events:none;transition:opacity .2s cubic-bezier(.2,.9,.2,1),transform .2s cubic-bezier(.2,.9,.2,1);backdrop-filter: blur(6px);}
#ptf-bubble-menu.visible{opacity:1;transform:scale(1) translateY(0);pointer-events:auto;}
#ptf-bubble-menu .item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;margin:6px 4px;cursor:pointer;transition:background .14s,transform .12s}
#ptf-bubble-menu .item:hover{background:rgba(255,255,255,0.02);transform:translateY(-2px)}
#ptf-bubble-menu .dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;box-shadow:0 2px 6px rgba(0,0,0,0.35) inset;}
#ptf-bubble-menu .label{font-size:13px;color:var(--pp-text);font-weight:700;letter-spacing:.3px}
#ptf-bubble-menu .item.active{outline:2px solid rgba(255,255,255,0.03); box-shadow: 0 6px 18px rgba(0,0,0,0.4) inset; background: rgba(255,255,255,0.01); }
#ptf-bubble-menu .foot{font-size:11px;color:var(--pp-muted);padding:6px 8px;text-align:center;opacity:.9}

/* responsive */
@media (max-width:520px){ #ptf-bubble-menu{left:10px;right:10px;min-width:auto} #ptf-bubble-eye{left:10px;bottom:10px} }
`;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  (document.head || document.documentElement).appendChild(styleEl);

  /* ========================= BUBBLE UI (cached references + active state) ========================== */
  let bubbleCreated = false;
  function createBubbleUI() {
    if (bubbleCreated) return;
    bubbleCreated = true;

    const eye = document.createElement('button');
    eye.id = 'ptf-bubble-eye';
    eye.type = 'button';
    eye.title = 'Themes';
    eye.setAttribute('aria-label', 'Show theme menu');
    eye.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    document.documentElement.appendChild(eye);

    const menu = document.createElement('div');
    menu.id = 'ptf-bubble-menu';
    menu.setAttribute('aria-hidden', 'true');

    THEMES.forEach(t => {
      const item = document.createElement('div');
      item.className = 'item';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.dataset.themeId = t.id;

      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = (t.vars['--pp-accent'] || '#888');

      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = t.name;

      item.appendChild(dot);
      item.appendChild(label);

      item.addEventListener('click', () => {
        applyTheme(t);
        saveThemeId(t.id);
        hideBubbleMenu();
      }, { passive: true });

      item.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); item.click(); }
      });

      menu.appendChild(item);
    });

    const foot = document.createElement('div');
    foot.className = 'foot';
    foot.textContent = 'Click a theme to apply • Click eye to close';
    menu.appendChild(foot);

    document.documentElement.appendChild(menu);

    eye.addEventListener('click', (ev) => { ev.stopPropagation(); toggleBubbleMenu(); }, { passive: true });

    document.addEventListener('click', (ev) => {
      const m = document.getElementById('ptf-bubble-menu');
      const b = document.getElementById('ptf-bubble-eye');
      if (!m || !b) return;
      if (m.classList.contains('visible') && !m.contains(ev.target) && !b.contains(ev.target)) hideBubbleMenu();
    });

    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') hideBubbleMenu(); });

    updateMenuActive(getSavedThemeId() || findThemeById(null).id);
  }

  function toggleBubbleMenu() {
    const m = document.getElementById('ptf-bubble-menu');
    if (!m) { createBubbleUI(); return; }
    if (m.classList.contains('visible')) hideBubbleMenu(); else showBubbleMenu();
  }
  function showBubbleMenu() { const m = document.getElementById('ptf-bubble-menu'); if (!m) return; m.classList.add('visible'); m.setAttribute('aria-hidden', 'false'); }
  function hideBubbleMenu() { const m = document.getElementById('ptf-bubble-menu'); if (!m) return; m.classList.remove('visible'); m.setAttribute('aria-hidden', 'true'); }

  function updateMenuActive(themeId) {
    const menu = document.getElementById('ptf-bubble-menu');
    if (!menu) return;
    menu.querySelectorAll('.item').forEach(it => {
      if (it.dataset.themeId === themeId) it.classList.add('active'); else it.classList.remove('active');
    });
  }

  /* ========================= EFFICIENT PRE-IMPORT FIXER ========================= */
  const TARGET_LABELS = ['home','this device','peadrive','dropbox','onedrive','google drive','peagames','photopea','vectorpea','jampea'];
  const CONTAINER_SELECTORS = ['.panelblock.home', '.pp-launcher', '.home-list', '.file-source-panel', '.left-panel', '.panel-left'];
  const fixedNodes = new WeakSet();
  let rafScheduled = false;

  function scheduleFix() {
    if (rafScheduled) return;
    rafScheduled = true;
    requestAnimationFrame(() => { rafScheduled = false; fixHomeLabels(); });
  }

  function enforceReadableStyles(el) {
    if (!el || !(el instanceof Element)) return;
    try {
      if (!fixedNodes.has(el)) {
        el.style.setProperty('color', 'var(--pp-text)', 'important');
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('-webkit-text-fill-color', 'var(--pp-text)', 'important');
        el.style.setProperty('mix-blend-mode', 'normal', 'important');
        el.style.setProperty('filter', 'none', 'important');
        el.style.setProperty('text-shadow', 'none', 'important');
      }

      const container = el.closest('button, a, [role="button"], .file-source-item, .home-list .item, .pp-launcher .item, .file-source-panel');
      if (container && !fixedNodes.has(container)) {
        container.style.setProperty('color', 'var(--pp-text)', 'important');
        container.style.setProperty('opacity', '1', 'important');
        container.style.setProperty('filter', 'none', 'important');
      }

      const refs = (container || el).querySelectorAll('svg, img, path');
      refs.forEach(icon => {
        try {
          icon.style.setProperty('opacity', '1', 'important');
          icon.style.setProperty('filter', 'none', 'important');
          if (icon instanceof SVGElement) {
            icon.style.setProperty('fill', 'var(--pp-text)', 'important');
            icon.style.setProperty('stroke', 'var(--pp-text)', 'important');
          }
        } catch (e) {}
      });

      fixedNodes.add(el);
      if (container) fixedNodes.add(container);
    } catch (e) {}
  }

  function fixHomeLabels() {
    try {
      const containers = [];
      for (const sel of CONTAINER_SELECTORS) {
        document.querySelectorAll(sel).forEach(n => containers.push(n));
      }
      if (containers.length === 0) {
        const left = document.querySelector('.left-panel, .leftbar, .panel-left');
        if (left) containers.push(left);
      }

      containers.forEach(container => {
        const candidates = container.querySelectorAll('a, button, span, div, li');
        candidates.forEach(node => {
          const txt = (node.textContent || '').trim().replace(/\s+/g,' ').toLowerCase();
          if (!txt || txt.length > 60) return;
          for (const label of TARGET_LABELS) {
            if (txt === label || txt.startsWith(label + ' ') || txt.indexOf(' ' + label + ' ') >= 0 || txt.endsWith(' ' + label)) {
              enforceReadableStyles(node);
              break;
            }
          }
        });
      });
    } catch (e) { console.warn('[ptf] fixHomeLabels error', e); }
  }

  /* ========================= TARGETED MUTATION OBSERVER ========================= */
  const bodyObserver = new MutationObserver((mutations) => {
    let found = false;
    for (const m of mutations) {
      if (m.type === 'childList' && m.addedNodes && m.addedNodes.length) {
        for (const n of m.addedNodes) {
          if (!(n instanceof Element)) continue;
          for (const sel of CONTAINER_SELECTORS) {
            if (n.matches && n.matches(sel)) { found = true; break; }
            if (n.querySelector && n.querySelector(sel)) { found = true; break; }
            if (n.closest && n.closest(sel)) { found = true; break; }
          }
          if (found) break;
        }
      }
      if (found) break;
    }
    if (found) scheduleFix();
  });

  function startObservingBody() {
    const root = document.body || document.documentElement;
    if (!root) return;
    bodyObserver.observe(root, { childList: true, subtree: true });
  }

  /* ========================= INIT ========================== */
  function init() {
    const savedId = getSavedThemeId();
    const theme = findThemeById(savedId || null);
    applyTheme(theme);

    createBubbleUI();

    fixHomeLabels();
    setTimeout(fixHomeLabels, 200);
    setTimeout(fixHomeLabels, 900);

    startObservingBody();

    console.log('%c[ptf] Photopea True Fullscreen v1.2.0 — Edge-optimized with aggressive width spoof + sidebar hijacker.', 'color:#ff7a00;font-weight:bold;');
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') requestAnimationFrame(init);
  else window.addEventListener('DOMContentLoaded', () => requestAnimationFrame(init), { once: true });

})();
