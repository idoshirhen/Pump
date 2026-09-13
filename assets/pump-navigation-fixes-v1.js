(() => {
  const TOP_BEHAVIOR = { top: 0, left: 0, behavior: 'instant' };
  let lastSignature = '';
  let rafId = 0;

  function scrollTopNow() {
    try {
      window.scrollTo(TOP_BEHAVIOR);
    } catch (_) {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const candidates = document.querySelectorAll(
      '[data-scroll-container], main, .screen, .page, .content, .app-content, .onboarding'
    );
    candidates.forEach((el) => {
      if (el && typeof el.scrollTo === 'function') {
        try { el.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
        catch (_) { el.scrollTop = 0; }
      } else if (el) {
        el.scrollTop = 0;
      }
    });
  }

  function cleanText(el) {
    return (el?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  }

  function getScreenSignature() {
    const selectedNav = document.querySelector(
      '[aria-current="page"], [aria-selected="true"], nav .active, nav [class*="active"]'
    );
    const heading = document.querySelector('main h1, main h2, #root h1, #root h2');
    const progress = document.querySelector(
      '[role="progressbar"], [class*="progress"], [class*="step"], [data-step]'
    );

    return [cleanText(selectedNav), cleanText(heading), cleanText(progress)].join('|');
  }

  function checkForScreenChange() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const nextSignature = getScreenSignature();
      if (lastSignature && nextSignature && nextSignature !== lastSignature) {
        requestAnimationFrame(scrollTopNow);
      }
      if (nextSignature) lastSignature = nextSignature;
    });
  }

  function repairPumpAssetUrls(root = document) {
    const images = root.querySelectorAll ? root.querySelectorAll('img[src]') : [];
    images.forEach((img) => {
      const raw = img.getAttribute('src') || '';
      if (
        location.hostname === 'appassets.androidplatform.net' &&
        raw.startsWith('/Pump/')
      ) {
        img.setAttribute('src', `./${raw.slice('/Pump/'.length)}`);
      }
    });
  }

  function init() {
    const root = document.getElementById('root') || document.body;
    repairPumpAssetUrls(document);
    lastSignature = getScreenSignature();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.matches?.('img[src]')) repairPumpAssetUrls(node.parentElement || document);
            else repairPumpAssetUrls(node);
          }
        });
      }
      checkForScreenChange();
    });

    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-current', 'aria-selected'] });

    window.addEventListener('popstate', () => requestAnimationFrame(scrollTopNow));
    window.addEventListener('hashchange', () => requestAnimationFrame(scrollTopNow));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
