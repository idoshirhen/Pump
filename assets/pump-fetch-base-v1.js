/* PUMP logic migration: capture the browser fetch before legacy data wrappers.
   This file intentionally has no DOM or style side effects. */
(() => {
  if (!window.__PUMP_NATIVE_FETCH) window.__PUMP_NATIVE_FETCH = window.fetch.bind(window);
})();
