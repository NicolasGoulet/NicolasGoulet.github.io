(() => {
  "use strict";

  const frame = document.getElementById("cervantes-life-map-frame");
  if (!frame) return;

  const parentRoot = document.documentElement;
  let resizeObserver = null;

  const syncTheme = () => {
    const childRoot = frame.contentDocument?.documentElement;
    if (!childRoot) return;

    if (parentRoot.getAttribute("data-theme") === "dark") {
      childRoot.setAttribute("data-theme", "dark");
    } else {
      childRoot.removeAttribute("data-theme");
    }
  };

  const syncHeight = () => {
    const map = frame.contentDocument?.getElementById("cervantes-life-map");
    if (map) frame.style.height = `${Math.ceil(map.getBoundingClientRect().height)}px`;
  };

  const addStepControls = map => {
    if (map.querySelector(".cvm__step-controls")) return;

    const childDocument = map.ownerDocument;
    const childWindow = childDocument.defaultView;
    const scrubber = map.querySelector("#cvm-scrubber");
    const originalPlay = map.querySelector("#cvm-play");
    if (!scrubber || !originalPlay) return;

    const playButton = originalPlay.cloneNode(true);
    originalPlay.replaceWith(playButton);

    const controls = childDocument.createElement("div");
    controls.className = "cvm__step-controls";
    controls.setAttribute("aria-label", "Journey navigation");

    const previousButton = childDocument.createElement("button");
    previousButton.type = "button";
    previousButton.className = "cvm__utility-button";
    previousButton.textContent = "← Previous";

    const speedButton = childDocument.createElement("button");
    speedButton.type = "button";
    speedButton.className = "cvm__utility-button";

    const nextButton = childDocument.createElement("button");
    nextButton.type = "button";
    nextButton.className = "cvm__utility-button";
    nextButton.textContent = "Next →";

    controls.append(previousButton, speedButton, nextButton);
    map.querySelector(".cvm__controls")?.after(controls);

    const playIcon = playButton.querySelector("#cvm-play-icon");
    const playLabel = playButton.querySelector("#cvm-play-label");
    const speeds = [0.5, 1, 2];
    let speedIndex = 1;
    let timer = null;
    let playing = false;
    let controlledUpdate = false;

    const currentPosition = () => Number(scrubber.value);
    const maxPosition = () => Number(scrubber.max);

    const updateButtons = () => {
      const position = currentPosition();
      previousButton.disabled = position <= 0;
      nextButton.disabled = position >= maxPosition();
      speedButton.textContent = `Speed ${speeds[speedIndex]}×`;
      speedButton.setAttribute("aria-label", `Playback speed ${speeds[speedIndex]} times; activate to change`);

      if (playing) {
        playIcon.textContent = "Ⅱ";
        playLabel.textContent = "Pause";
        playButton.setAttribute("aria-label", "Pause Cervantes’s journey");
      } else if (position >= maxPosition()) {
        playIcon.textContent = "↻";
        playLabel.textContent = "Replay journey";
        playButton.setAttribute("aria-label", "Replay Cervantes’s journey");
      } else {
        playIcon.textContent = "▶";
        playLabel.textContent = position > 0 ? "Resume journey" : "Play journey";
        playButton.setAttribute("aria-label", playLabel.textContent);
      }
    };

    const stopPlayback = () => {
      playing = false;
      if (timer !== null) childWindow.clearTimeout(timer);
      timer = null;
      updateButtons();
    };

    const goTo = (position, keepPlaying = false) => {
      const nextPosition = Math.max(0, Math.min(maxPosition(), position));
      controlledUpdate = true;
      scrubber.value = String(nextPosition);
      scrubber.dispatchEvent(new childWindow.Event("input", { bubbles: true }));
      controlledUpdate = false;
      if (!keepPlaying) stopPlayback();
      updateButtons();
      syncHeight();
    };

    const scheduleStep = () => {
      timer = childWindow.setTimeout(() => {
        const position = Math.round(currentPosition());
        if (position >= maxPosition()) {
          stopPlayback();
          return;
        }

        goTo(position + 1, true);
        if (currentPosition() >= maxPosition()) stopPlayback();
        else scheduleStep();
      }, 1080 / speeds[speedIndex]);
    };

    const startPlayback = () => {
      if (currentPosition() >= maxPosition()) goTo(0, true);
      playing = true;
      updateButtons();
      scheduleStep();
    };

    playButton.addEventListener("click", () => {
      if (playing) stopPlayback();
      else startPlayback();
    });

    previousButton.addEventListener("click", () => {
      goTo(Math.ceil(currentPosition()) - 1);
    });

    nextButton.addEventListener("click", () => {
      goTo(Math.floor(currentPosition()) + 1);
    });

    speedButton.addEventListener("click", () => {
      speedIndex = (speedIndex + 1) % speeds.length;
      if (playing) {
        childWindow.clearTimeout(timer);
        scheduleStep();
      }
      updateButtons();
    });

    scrubber.addEventListener("input", () => {
      if (!controlledUpdate) stopPlayback();
      updateButtons();
    });

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
