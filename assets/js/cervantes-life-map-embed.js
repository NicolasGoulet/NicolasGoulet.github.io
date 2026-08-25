(() => {
  "use strict";

  const frame = document.getElementById("cervantes-life-map-frame");
  if (!frame) return;

  const parentRoot = document.documentElement;
  let resizeObserver = null;

  const mapLanguage = frame.dataset.language === "fr" || parentRoot.lang.toLowerCase().startsWith("fr")
    ? "fr"
    : "en";

  const controlText = mapLanguage === "fr"
    ? {
        navigation: "Navigation du voyage",
        previous: "← Précédent",
        next: "Suivant →",
        pauseHint: "Mettez le voyage en pause pour changer de lieu",
        previousHint: "Lieu précédent",
        nextHint: "Lieu suivant",
        speed: "Vitesse",
        speedLabel: rate => `Vitesse de lecture ${rate}; activer pour la modifier`
      }
    : {
        navigation: "Journey navigation",
        previous: "← Previous",
        next: "Next →",
        pauseHint: "Pause the journey to move between places",
        previousHint: "Previous place",
        nextHint: "Next place",
        speed: "Speed",
        speedLabel: rate => `Playback speed ${rate}; activate to change`
      };

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
    childWindow.dispatchEvent(new childWindow.CustomEvent("cvm:languagechange", {
      detail: { language: mapLanguage }
    }));
  };

  const syncHeight = () => {
    const map = frame.contentDocument?.getElementById("cervantes-life-map");
    if (map) frame.style.height = `${Math.ceil(map.getBoundingClientRect().height)}px`;
  };

  const installAnimationClock = childWindow => {
    if (childWindow.__cvmPlaybackClock) return childWindow.__cvmPlaybackClock;

    const nativeRequestAnimationFrame = childWindow.requestAnimationFrame.bind(childWindow);
    let playbackRate = 1;
    let previousRealTime = null;
    let virtualTime = null;

    childWindow.requestAnimationFrame = callback => nativeRequestAnimationFrame(realTime => {
      if (previousRealTime === null) {
        previousRealTime = realTime;
        virtualTime = realTime;
      } else {
        virtualTime += (realTime - previousRealTime) * playbackRate;
        previousRealTime = realTime;
      }
      callback(virtualTime);
    });

    childWindow.__cvmPlaybackClock = {
      setRate(rate) {
        playbackRate = rate;
      }
    };

    return childWindow.__cvmPlaybackClock;
  };

  const addStepControls = map => {
    if (map.querySelector(".cvm__step-controls")) return;

    const childDocument = map.ownerDocument;
    const childWindow = childDocument.defaultView;
    const scrubber = map.querySelector("#cvm-scrubber");
    const playButton = map.querySelector("#cvm-play");
    const playLabel = map.querySelector("#cvm-play-label");
    const controlsRow = map.querySelector(".cvm__controls");
    if (!scrubber || !playButton || !playLabel || !controlsRow) return;

    const animationClock = installAnimationClock(childWindow);
    controlsRow.classList.add("cvm__controls--enhanced");

    const controls = childDocument.createElement("div");
    controls.className = "cvm__step-controls";
    controls.setAttribute("aria-label", controlText.navigation);

    const previousButton = childDocument.createElement("button");
    previousButton.type = "button";
    previousButton.className = "cvm__utility-button";
    previousButton.textContent = controlText.previous;

    const speedButton = childDocument.createElement("button");
    speedButton.type = "button";
    speedButton.className = "cvm__utility-button cvm__speed-button";

    const nextButton = childDocument.createElement("button");
    nextButton.type = "button";
    nextButton.className = "cvm__utility-button";
    nextButton.textContent = controlText.next;

    controls.append(previousButton, nextButton, speedButton);
    controlsRow.append(controls);

    const speeds = [
      { rate: 0.5, label: "½×" },
      { rate: 1, label: "1×" },
      { rate: 2, label: "2×" }
    ];
    let speedIndex = 1;

    const currentPosition = () => Number(scrubber.value);
    const maxPosition = () => Number(scrubber.max);
    const isPlaying = () => playLabel.textContent.trim() === "Pause";

    const updateButtons = () => {
      const position = currentPosition();
      const playing = isPlaying();
      previousButton.disabled = playing || Math.round(position) <= 0;
      nextButton.disabled = playing || Math.round(position) >= maxPosition();
      previousButton.title = playing ? controlText.pauseHint : controlText.previousHint;
      nextButton.title = playing ? controlText.pauseHint : controlText.nextHint;

      const speed = speeds[speedIndex];
      speedButton.textContent = `${controlText.speed} ${speed.label}`;
      speedButton.setAttribute("aria-label", controlText.speedLabel(speed.label));
    };

    const goTo = position => {
      if (isPlaying()) return;
      const nextPosition = Math.max(0, Math.min(maxPosition(), position));
      scrubber.value = String(nextPosition);
      scrubber.dispatchEvent(new childWindow.Event("input", { bubbles: true }));
      updateButtons();
      syncHeight();
    };

    playButton.addEventListener("click", () => {
      childWindow.queueMicrotask(updateButtons);
    });

    previousButton.addEventListener("click", () => {
      goTo(Math.round(currentPosition()) - 1);
    });

    nextButton.addEventListener("click", () => {
      goTo(Math.round(currentPosition()) + 1);
    });

    speedButton.addEventListener("click", () => {
      speedIndex = (speedIndex + 1) % speeds.length;
      animationClock.setRate(speeds[speedIndex].rate);
      updateButtons();
    });

    scrubber.addEventListener("input", updateButtons);

    new childWindow.MutationObserver(updateButtons).observe(playLabel, {
      childList: true,
      characterData: true,
      subtree: true
    });

    animationClock.setRate(speeds[speedIndex].rate);
    updateButtons();
  };

  const enhanceMap = () => {
    const childDocument = frame.contentDocument;
    const map = childDocument?.getElementById("cervantes-life-map");
    if (!childDocument || !map) return;

    if (!childDocument.getElementById("cervantes-life-map-embed-styles")) {
      const stylesheet = childDocument.createElement("link");
      stylesheet.id = "cervantes-life-map-embed-styles";
      stylesheet.rel = "stylesheet";
      stylesheet.href = frame.dataset.embedStylesheet;
      stylesheet.addEventListener("load", syncHeight);
      childDocument.head.append(stylesheet);
    }

    syncTheme();
    syncLanguage();
    addStepControls(map);

    resizeObserver?.disconnect();
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(syncHeight);
      resizeObserver.observe(map);
    }

    window.requestAnimationFrame(syncHeight);
  };

  frame.addEventListener("load", enhanceMap);
  if (frame.contentDocument?.getElementById("cervantes-life-map")) enhanceMap();

  new MutationObserver(syncTheme).observe(parentRoot, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });
})();
