/*
 * Click sound effects
 *
 * Put an audio file in /assets/audio/sfx/, then add its filename to any
 * clickable element:
 *
 *   <button data-sound="stingus">Click me</button>
 *
 * MP3 is assumed when the extension is omitted. Exact filenames work too:
 *
 *   <button data-sound="my-sound.ogg" data-sound-volume="0.5">Click me</button>
 */
(function () {
  "use strict";

  var script = document.currentScript;
  var soundsBase = script && script.dataset.soundsBase
    ? script.dataset.soundsBase
    : "/assets/audio/sfx/";
  var soundTemplates = new Map();
  var activeSounds = new Set();
  var muted = false;

  function filenameFor(soundName) {
    var filename = String(soundName || "").trim();

    if (!filename) {
      throw new Error("A sound filename is required.");
    }

    // Keep data-sound as a filename, not a path or remote URL.
    if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
      throw new Error("Sound names must be filenames from assets/audio/sfx.");
    }

    return /\.[a-z0-9]+$/i.test(filename) ? filename : filename + ".mp3";
  }

  function soundTemplate(soundName) {
    var filename = filenameFor(soundName);

    if (!soundTemplates.has(filename)) {
      var audio = new Audio(soundsBase + encodeURIComponent(filename));
      audio.preload = "auto";
      soundTemplates.set(filename, audio);
    }

    return soundTemplates.get(filename);
  }

  function numberBetween(value, fallback, minimum, maximum) {
    var number = Number(value);
    return Number.isFinite(number)
      ? Math.min(maximum, Math.max(minimum, number))
      : fallback;
  }

  function play(soundName, options) {
    if (muted) return null;

    var settings = options || {};
    var audio;

    try {
      audio = soundTemplate(soundName).cloneNode(true);
    } catch (error) {
      console.warn("Could not prepare website sound:", error);
      return null;
    }

    audio.volume = numberBetween(settings.volume, 1, 0, 1);
    audio.playbackRate = numberBetween(settings.rate, 1, 0.25, 4);
    activeSounds.add(audio);

    var cleanUp = function () {
      activeSounds.delete(audio);
    };

    audio.addEventListener("ended", cleanUp, { once: true });
    audio.addEventListener("error", cleanUp, { once: true });

    var playback = audio.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(function (error) {
        cleanUp();
        if (typeof settings.onPlaybackBlocked === "function") {
          settings.onPlaybackBlocked(error);
        } else {
          console.warn('Could not play sound "' + soundName + '":', error);
        }
      });
    }

    return audio;
  }

  function preload(soundName) {
    try {
      soundTemplate(soundName).load();
    } catch (error) {
      console.warn("Could not preload website sound:", error);
    }
  }

  function stopAll() {
    activeSounds.forEach(function (audio) {
      audio.pause();
      audio.currentTime = 0;
    });
    activeSounds.clear();
  }

  function playOnArrival(soundName, options) {
    var settings = options || {};
    var waitingForInteraction = false;

    var playAfterInteraction = function () {
      document.removeEventListener("pointerdown", playAfterInteraction, true);
      document.removeEventListener("keydown", playAfterInteraction, true);
      play(soundName, settings);
    };

    var waitForInteraction = function () {
      if (waitingForInteraction) return;
      waitingForInteraction = true;

      // Browsers commonly block audible autoplay. The first real interaction
      // supplies the user gesture they require, without adding an overlay.
      document.addEventListener("pointerdown", playAfterInteraction, {
        capture: true,
        once: true
      });
      document.addEventListener("keydown", playAfterInteraction, {
        capture: true,
        once: true
      });
    };

    play(soundName, {
      volume: settings.volume,
      rate: settings.rate,
      onPlaybackBlocked: waitForInteraction
    });
  }

  document.addEventListener("click", function (event) {
    var clickedElement = event.target instanceof Element
      ? event.target.closest("[data-sound]")
      : null;

    if (
      !clickedElement ||
      clickedElement.hasAttribute("disabled") ||
      clickedElement.getAttribute("aria-disabled") === "true"
    ) {
      return;
    }

    play(clickedElement.dataset.sound, {
      volume: clickedElement.dataset.soundVolume,
      rate: clickedElement.dataset.soundRate
    });
  });

  // Only preload sounds that are actually used on the current page.
  document.querySelectorAll("[data-sound]").forEach(function (element) {
    preload(element.dataset.sound);
  });

  if (document.body && document.body.dataset.arrivalSound) {
    playOnArrival(document.body.dataset.arrivalSound, {
      volume: document.body.dataset.arrivalSoundVolume,
      rate: document.body.dataset.arrivalSoundRate
    });
  }

  // Optional JavaScript API: siteSounds.play("stingus")
  window.siteSounds = Object.freeze({
    play: play,
    playOnArrival: playOnArrival,
    preload: preload,
    stopAll: stopAll,
    setMuted: function (value) {
      muted = Boolean(value);
      if (muted) stopAll();
    },
    isMuted: function () {
      return muted;
    }
  });
})();
