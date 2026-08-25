(() => {
  "use strict";

  const frame = document.getElementById("al-andalus-history-map-frame");
  if (!frame) return;

  const parentRoot = document.documentElement;
  let resizeObserver = null;
  const mapLanguage = frame.dataset.language === "fr" || parentRoot.lang.toLowerCase().startsWith("fr")
    ? "fr"
    : "en";

  const syncTheme = () => {
    const childRoot = frame.contentDocument?.documentElement;
    if (!childRoot) return;

    if (parentRoot.getAttribute("data-theme") === "dark") {
      childRoot.setAttribute("data-theme", "dark");
    } else {
      childRoot.removeAttribute("data-theme");
    }
  };

  const syncLanguage = () => {
    const childRoot = frame.contentDocument?.documentElement;
    const childWindow = frame.contentWindow;
    if (!childRoot || !childWindow) return;

    childRoot.lang = mapLanguage;
    childWindow.dispatchEvent(new childWindow.CustomEvent("aam:languagechange", {
      detail: { language: mapLanguage }
    }));
  };

  const syncHeight = () => {
    const map = frame.contentDocument?.getElementById("al-andalus-history-map");
    if (map) frame.style.height = `${Math.ceil(map.getBoundingClientRect().height)}px`;
  };

  const enhanceMap = () => {
    const childDocument = frame.contentDocument;
    const map = childDocument?.getElementById("al-andalus-history-map");
    if (!childDocument || !map) return;

    if (!childDocument.getElementById("al-andalus-history-map-embed-styles")) {
      const stylesheet = childDocument.createElement("link");
      stylesheet.id = "al-andalus-history-map-embed-styles";
      stylesheet.rel = "stylesheet";
      stylesheet.href = frame.dataset.embedStylesheet;
      stylesheet.addEventListener("load", syncHeight);
      childDocument.head.append(stylesheet);
    }

    syncTheme();
    syncLanguage();

    resizeObserver?.disconnect();
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(syncHeight);
      resizeObserver.observe(map);
    }

    window.requestAnimationFrame(syncHeight);
  };

  frame.addEventListener("load", enhanceMap);
  if (frame.contentDocument?.getElementById("al-andalus-history-map")) enhanceMap();

  new MutationObserver(syncTheme).observe(parentRoot, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });
})();
