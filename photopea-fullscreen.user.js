// ==UserScript==
// @name         Photopea True Fullscreen
// @namespace    https://github.com/ghostlybliss
// @version      1.4.0
// @description  True fullscreen for Photopea with Edge / Chromium hardening and targeted warning suppression.
// @author       ghostlybliss
// @match        https://www.photopea.com/*
// @match        https://photopea.com/*
// @run-at       document-start
// @grant        none
// @sandbox      raw
// @inject-into  page
// @noframes
// @license      MIT
// @icon         https://www.photopea.com/promo/icon512.png
// @downloadURL  https://update.greasyfork.org/scripts/567062/Photopea%20True%20Fullscreen.user.js
// @updateURL    https://update.greasyfork.org/scripts/567062/Photopea%20True%20Fullscreen.meta.js
// ==/UserScript==

(function () {
  'use strict';

  /* ============================================================
     CONFIG
     ============================================================ */

  const SPOOF_EXTRA_WIDTH = 320;

  /*
    Capture the browser's real width before replacing innerWidth.
    Used only as an extremely-early-startup fallback.
  */
  const INITIAL_REAL_WIDTH = window.innerWidth;


  /* ============================================================
     TRUE FULLSCREEN WIDTH SPOOF
     ============================================================ */

  function getRealViewportWidth() {
    /*
      visualViewport.width is not affected by our innerWidth spoof,
      making it the preferred real viewport measurement.
    */
    try {
      if (
        window.visualViewport &&
        Number.isFinite(window.visualViewport.width) &&
        window.visualViewport.width > 0
      ) {
        return Math.round(window.visualViewport.width);
      }
    } catch (e) {}


    /*
      Standard document viewport fallback.
    */
    try {
      if (
        document.documentElement &&
        document.documentElement.clientWidth > 0
      ) {
        return document.documentElement.clientWidth;
      }
    } catch (e) {}


    /*
      Secondary layout fallback.
    */
    try {
      if (
        document.documentElement &&
        document.documentElement.offsetWidth > 0
      ) {
        return document.documentElement.offsetWidth;
      }
    } catch (e) {}


    /*
      Final fallback captured before the spoof existed.
    */
    return INITIAL_REAL_WIDTH;
  }


  function createSpoofGetter() {
    const getter = function () {
      return getRealViewportWidth() + SPOOF_EXTRA_WIDTH;
    };

    /*
      Private marker used to recognize our own getter later.
    */
    getter.__ptfSpoof = true;

    return getter;
  }


  function applySpoof() {
    try {
      const descriptor =
        Object.getOwnPropertyDescriptor(window, 'innerWidth');


      /*
        If our getter is already installed, leave it alone.
      */
      if (
        descriptor &&
        typeof descriptor.get === 'function' &&
        descriptor.get.__ptfSpoof
      ) {
        return true;
      }


      Object.defineProperty(window, 'innerWidth', {
        get: createSpoofGetter(),
        configurable: true,
        enumerable: true
      });


      return true;

    } catch (e) {
      console.warn(
        '[ptf] Could not install innerWidth spoof:',
        e
      );

      return false;
    }
  }


  /* ============================================================
     PHOTOPEA RELAYOUT
     ============================================================ */

  let relayoutQueued = false;


  function forcePhotopeaRelayout() {
    /*
      Reinstate the spoof first in case Photopea, the browser,
      or another script replaced it.
    */
    applySpoof();


    /*
      Collapse repeated relayout requests into one animation frame.
    */
    if (relayoutQueued) {
      return;
    }

    relayoutQueued = true;


    requestAnimationFrame(() => {
      relayoutQueued = false;

      try {
        /*
          Important for Edge:

          If Photopea performed a layout calculation before our
          spoof became active, changing innerWidth alone does not
          necessarily force Photopea to reconsider the workspace.

          Dispatching resize makes Photopea run its normal responsive
          layout code while seeing the spoofed width.
        */
        window.dispatchEvent(
          new Event('resize')
        );

      } catch (e) {}
    });
  }


  /*
    Install immediately.

    @run-at document-start gives this the best possible chance of
    beating Photopea's initial layout calculation.
  */
  applySpoof();


  /* ============================================================
     STARTUP HARDENING
     ============================================================ */

  /*
    Edge / Chromium can execute page initialization in slightly
    different timing windows.

    These are temporary startup checks only. They naturally stop
    after 6.5 seconds.
  */

  const STARTUP_RELAYOUT_DELAYS = [
    0,
    20,
    50,
    100,
    200,
    350,
    600,
    1000,
    1500,
    2500,
    4000,
    6500
  ];


  STARTUP_RELAYOUT_DELAYS.forEach(delay => {
    setTimeout(
      forcePhotopeaRelayout,
      delay
    );
  });


  /*
    Reinforce after initial DOM construction.
  */
  document.addEventListener(
    'DOMContentLoaded',
    forcePhotopeaRelayout,
    { once: true }
  );


  /*
    Reinforce after normal page resources finish loading.
  */
  window.addEventListener(
    'load',
    forcePhotopeaRelayout,
    { once: true }
  );


  /* ============================================================
     TAB / WINDOW RESTORATION
     ============================================================ */

  /*
    Chromium-family browsers can recalculate viewport or compositor
    state when a backgrounded tab becomes visible again.
  */
  document.addEventListener(
    'visibilitychange',
    () => {
      if (!document.hidden) {
        forcePhotopeaRelayout();

        /*
          Delayed passes catch asynchronous tab restoration.
        */
        setTimeout(
          forcePhotopeaRelayout,
          150
        );

        setTimeout(
          forcePhotopeaRelayout,
          500
        );
      }
    }
  );


  /*
    Reinforce when focus returns to the browser window.
  */
  window.addEventListener(
    'focus',
    () => {
      forcePhotopeaRelayout();

      setTimeout(
        forcePhotopeaRelayout,
        100
      );
    }
  );


  /* ============================================================
     REAL VIEWPORT CHANGES
     ============================================================ */

  /*
    Listen to the real visual viewport when supported.

    This catches actual browser resizing without depending on our
    spoofed window.innerWidth.
  */
  try {
    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        'resize',
        forcePhotopeaRelayout,
        { passive: true }
      );
    }
  } catch (e) {}


  /* ============================================================
     SPOOF INTEGRITY WATCHDOG
     ============================================================ */

  /*
    Once every three seconds, verify that our innerWidth getter
    still exists.

    When everything is healthy, this does absolutely nothing.

    If another script replaces the property during a long Photopea
    session, the working spoof is restored automatically.
  */
  setInterval(
    () => {
      try {
        const descriptor =
          Object.getOwnPropertyDescriptor(
            window,
            'innerWidth'
          );


        const spoofStillInstalled =
          descriptor &&
          typeof descriptor.get === 'function' &&
          descriptor.get.__ptfSpoof;


        if (!spoofStillInstalled) {
          console.log(
            '[ptf] innerWidth spoof was replaced — restoring it.'
          );

          forcePhotopeaRelayout();
        }

      } catch (e) {}
    },
    3000
  );


  /* ============================================================
     PHOTOPEA SOURCE-CODE WARNING SUPPRESSION
     ============================================================ */

  /*
    This targets ONLY the specific Photopea warning:

    "Something is changing our source code ..."
    "Many features will not work correctly."

    Other Photopea notifications, errors, dialogs and warnings
    are not intentionally affected.
  */

  const SOURCE_WARNING_START =
    'Something is changing our source code';

  const SOURCE_WARNING_END =
    'Many features will not work correctly';


  function normalizeText(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim();
  }


  function isSourceCodeWarningText(value) {
    const text =
      normalizeText(value);


    /*
      Requiring both distinctive portions keeps the match specific.
    */
    return (
      text.length > 0 &&
      text.length < 300 &&
      text.includes(SOURCE_WARNING_START) &&
      text.includes(SOURCE_WARNING_END)
    );
  }


  /* ============================================================
     LOCATE THE WARNING CONTAINER
     ============================================================ */

  function findBestWarningContainer(element) {
    let target =
      element;

    let current =
      element;


    const originalText =
      normalizeText(
        element.textContent
      );


    /*
      Walk upward only through a few small wrappers which still
      contain essentially nothing except the warning.

      This prevents the script from accidentally removing a large
      Photopea interface container.
    */
    for (
      let depth = 0;
      depth < 8;
      depth++
    ) {

      const parent =
        current.parentElement;


      if (
        !parent ||
        parent === document.documentElement ||
        parent === document.body
      ) {
        break;
      }


      const parentText =
        normalizeText(
          parent.textContent
        );


      /*
        Stop as soon as the parent contains unrelated text.
      */
      if (
        !isSourceCodeWarningText(parentText) ||
        parentText.length > originalText.length + 20
      ) {
        break;
      }


      let reasonableSize =
        true;


      try {
        const rect =
          parent.getBoundingClientRect();


        /*
          A warning wrapper should never occupy a huge portion of
          the application's vertical interface.
        */
        if (
          rect.height > 250 ||
          rect.width <= 0 ||
          rect.height <= 0
        ) {
          reasonableSize = false;
        }

      } catch (e) {}


      if (!reasonableSize) {
        break;
      }


      target =
        parent;

      current =
        parent;
    }


    return target;
  }


  /* ============================================================
     REMOVE THE WARNING
     ============================================================ */

  function removeSourceCodeWarningFromElement(element) {
    if (!(element instanceof Element)) {
      return false;
    }


    /*
      Fast rejection.

      Most mutations have nothing to do with our warning, so avoid
      searching their descendants unnecessarily.
    */
    const subtreeText =
      normalizeText(
        element.textContent
      );


    if (
      !subtreeText.includes(
        SOURCE_WARNING_START
      )
    ) {
      return false;
    }


    const candidates = [
      element
    ];


    /*
      Search only the relevant subtree rather than the entire page.
    */
    try {
      candidates.push(
        ...element.querySelectorAll(
          'div, span, p'
        )
      );
    } catch (e) {}


    for (
      const candidate of candidates
    ) {

      if (
        !(candidate instanceof HTMLElement)
      ) {
        continue;
      }


      if (
        !isSourceCodeWarningText(
          candidate.textContent
        )
      ) {
        continue;
      }


      const target =
        findBestWarningContainer(
          candidate
        );


      /*
        Final safety check immediately before removal.
      */
      if (
        target &&
        isSourceCodeWarningText(
          target.textContent
        )
      ) {

        try {
          target.remove();

          console.log(
            '[ptf] Suppressed Photopea source-code warning.'
          );

          return true;

        } catch (e) {}
      }
    }


    return false;
  }


  /* ============================================================
     INITIAL WARNING SCAN
     ============================================================ */

  function removeExistingSourceCodeWarnings() {
    try {
      const elements =
        document.querySelectorAll(
          'div, span, p'
        );


      for (
        const element of elements
      ) {

        if (
          isSourceCodeWarningText(
            element.textContent
          )
        ) {

          removeSourceCodeWarningFromElement(
            element
          );
        }
      }

    } catch (e) {}
  }


  /* ============================================================
     WARNING OBSERVER
     ============================================================ */

  let warningSuppressorStarted =
    false;


  const warningObserver =
    new MutationObserver(
      mutations => {

        for (
          const mutation of mutations
        ) {

          /*
            Catch newly-created warning elements.
          */
          if (
            mutation.type === 'childList'
          ) {

            for (
              const node of mutation.addedNodes
            ) {

              if (
                node.nodeType === Node.ELEMENT_NODE
              ) {

                removeSourceCodeWarningFromElement(
                  node
                );

              } else if (
                node.nodeType === Node.TEXT_NODE &&
                node.parentElement
              ) {

                removeSourceCodeWarningFromElement(
                  node.parentElement
                );
              }
            }
          }


          /*
            Catch cases where Photopea creates the element first,
            then fills or modifies its text afterward.
          */
          if (
            mutation.type === 'characterData' &&
            mutation.target.parentElement
          ) {

            removeSourceCodeWarningFromElement(
              mutation.target.parentElement
            );
          }
        }
      }
    );


  function startWarningSuppressor() {
    if (
      warningSuppressorStarted ||
      !document.documentElement
    ) {
      return;
    }


    warningSuppressorStarted =
      true;


    /*
      Catch a warning that appeared before the observer started.
    */
    removeExistingSourceCodeWarnings();


    /*
      Catch future copies as Photopea creates them.
    */
    warningObserver.observe(
      document.documentElement,
      {
        childList: true,
        subtree: true,
        characterData: true
      }
    );
  }


  /*
    Begin warning suppression as early as possible.
  */
  if (
    document.documentElement
  ) {

    startWarningSuppressor();

  } else {

    document.addEventListener(
      'DOMContentLoaded',
      startWarningSuppressor,
      { once: true }
    );
  }


  /* ============================================================
     INITIALIZATION
     ============================================================ */

  let initialized =
    false;


  function init() {
    if (initialized) {
      return;
    }


    initialized =
      true;


    /*
      One final fullscreen reinforcement once the DOM is usable.
    */
    forcePhotopeaRelayout();


    /*
      Ensure warning suppression is running.
    */
    startWarningSuppressor();


    /* ==========================================================
       DIAGNOSTICS
       ========================================================== */

    try {
      console.log(
        '%c[ptf] Photopea True Fullscreen v1.4.0 — fullscreen-only, Edge-hardened, warning suppression active.',
        'color:#ff7a00;font-weight:bold;'
      );


      console.log(
        '[ptf] viewport:',
        {
          reportedInnerWidth:
            window.innerWidth,

          realClientWidth:
            document.documentElement.clientWidth,

          visualViewportWidth:
            window.visualViewport
              ? window.visualViewport.width
              : null,

          spoofDifference:
            window.innerWidth -
            document.documentElement.clientWidth
        }
      );

    } catch (e) {}
  }


  /*
    Initialize as soon as the document is ready enough.
  */
  if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
  ) {

    requestAnimationFrame(
      init
    );

  } else {

    window.addEventListener(
      'DOMContentLoaded',
      () => {
        requestAnimationFrame(
          init
        );
      },
      { once: true }
    );
  }

})();
