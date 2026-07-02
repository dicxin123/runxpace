/**
 * flash.js — reads flash messages injected by the server via
 * a <meta> tag and displays them in the matching DOM element.
 *
 * The server injects messages as:
 *   <meta name="flash-error"   content="Something went wrong">
 *   <meta name="flash-success" content="All good!">
 *
 * Because we serve raw HTML files (not a templating engine),
 * flash messages are passed via query params on redirects and
 * decoded here. A real app should use a template engine (EJS, Pug)
 * to inject them server-side; see README for details.
 */

(function () {
  const params = new URLSearchParams(window.location.search);

  ['error', 'success'].forEach(type => {
    const msg = params.get(type);
    if (!msg) return;
    const el = document.getElementById(`flash-${type}`);
    if (el) {
      el.textContent = decodeURIComponent(msg);
      el.style.display = 'block';
    }
    // Clean the URL
    params.delete(type);
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    history.replaceState({}, '', newUrl);
  });
})();
