(() => {
  const replaceDashes = (value) => typeof value === 'string' && value.includes('—') ? value.replaceAll('—', '-') : value;

  const normalizeNode = (node) => {
    if (!node) return;

    if (node.nodeType === Node.TEXT_NODE) {
      const next = replaceDashes(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node;
    ['placeholder', 'title', 'aria-label'].forEach((attr) => {
      if (!el.hasAttribute(attr)) return;
      const current = el.getAttribute(attr);
      const next = replaceDashes(current);
      if (next !== current) el.setAttribute(attr, next);
    });

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let textNode;
    while ((textNode = walker.nextNode())) {
      const next = replaceDashes(textNode.nodeValue);
      if (next !== textNode.nodeValue) textNode.nodeValue = next;
    }
  };

  const normalizeAll = () => normalizeNode(document.body);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', normalizeAll, { once: true });
  } else {
    normalizeAll();
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        normalizeNode(mutation.target);
        continue;
      }
      for (const node of mutation.addedNodes) normalizeNode(node);
    }
  });

  const startObserver = () => {
    if (!document.body) return;
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver, { once: true });
  } else {
    startObserver();
  }
})();
