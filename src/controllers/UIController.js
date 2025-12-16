// UI Controller - Handles user interface interactions

export class UIController {
  constructor(voiceManager, audioEngine) {
    this.voiceManager = voiceManager;
    this.audioEngine = audioEngine;
  }

  setupControls() {
    // Oscillator 1 controls
    this.setupControl(
      "osc1-wave",
      (value) => (this.voiceManager.osc1.wave = value)
    );
    this.setupSlider(
      "osc1-detune",
      (value) => (this.voiceManager.osc1.detune = parseFloat(value))
    );
    this.setupSlider(
      "osc1-level",
      (value) => (this.voiceManager.osc1.level = value / 100)
    );

    // Oscillator 2 controls
    this.setupControl(
      "osc2-wave",
      (value) => (this.voiceManager.osc2.wave = value)
    );
    this.setupSlider(
      "osc2-detune",
      (value) => (this.voiceManager.osc2.detune = parseFloat(value))
    );
    this.setupSlider(
      "osc2-level",
      (value) => (this.voiceManager.osc2.level = value / 100)
    );

    // Noise control
    this.setupSlider(
      "noise-level",
      (value) => (this.voiceManager.noiseLevel = value / 100)
    );

    // Octave control
    this.setupSlider(
      "octave",
      (value) => (this.voiceManager.octave = parseInt(value))
    );

    // Filter controls
    this.setupControl(
      "filter-type",
      (value) => (this.voiceManager.filter.type = value)
    );
    this.setupSlider(
      "filter-cutoff",
      (value) => (this.voiceManager.filter.cutoff = parseFloat(value))
    );
    this.setupSlider(
      "filter-resonance",
      (value) => (this.voiceManager.filter.resonance = parseFloat(value))
    );
    this.setupSlider(
      "filter-env-amount",
      (value) => (this.voiceManager.filter.envAmount = parseFloat(value))
    );
    this.setupSlider(
      "filter-attack",
      (value) => (this.voiceManager.filter.attack = parseFloat(value))
    );
    this.setupSlider(
      "filter-decay",
      (value) => (this.voiceManager.filter.decay = parseFloat(value))
    );

    // Amplitude envelope controls
    this.setupSlider(
      "attack",
      (value) => (this.voiceManager.ampEnv.attack = parseFloat(value))
    );
    this.setupSlider(
      "decay",
      (value) => (this.voiceManager.ampEnv.decay = parseFloat(value))
    );
    this.setupSlider(
      "sustain",
      (value) => (this.voiceManager.ampEnv.sustain = parseFloat(value))
    );
    this.setupSlider(
      "release",
      (value) => (this.voiceManager.ampEnv.release = parseFloat(value))
    );

    // LFO controls
    this.setupControl(
      "lfo-wave",
      (value) => (this.voiceManager.lfo.wave = value)
    );
    this.setupSlider(
      "lfo-rate",
      (value) => (this.voiceManager.lfo.rate = parseFloat(value))
    );
    this.setupSlider(
      "lfo-pitch-depth",
      (value) => (this.voiceManager.lfo.pitchDepth = parseFloat(value))
    );
    this.setupSlider(
      "lfo-filter-depth",
      (value) => (this.voiceManager.lfo.filterDepth = parseFloat(value))
    );
    this.setupSlider(
      "lfo-amp-depth",
      (value) => (this.voiceManager.lfo.ampDepth = parseFloat(value) / 100)
    );

    // Effects controls
    this.setupSlider("distortion-drive", (value) => {
      this.audioEngine.effects.distortionDrive = parseFloat(value);
      if (this.audioEngine.distortion) {
        this.audioEngine.updateDistortionCurve(
          this.audioEngine.effects.distortionDrive
        );
      }
    });

    this.setupSlider("chorus-rate", (value) => {
      this.audioEngine.effects.chorusRate = parseFloat(value);
      if (this.audioEngine.chorusLFO) {
        this.audioEngine.chorusLFO.frequency.value =
          this.audioEngine.effects.chorusRate;
      }
    });

    this.setupSlider("chorus-depth", (value) => {
      this.audioEngine.effects.chorusDepth = parseFloat(value) / 100;
      if (this.audioEngine.chorusWet && this.audioEngine.chorusDry) {
        this.audioEngine.chorusWet.gain.value =
          this.audioEngine.effects.chorusDepth;
      }
    });

    this.setupSlider("flanger-rate", (value) => {
      this.audioEngine.effects.flangerRate = parseFloat(value);
      if (this.audioEngine.flangerLFO) {
        this.audioEngine.flangerLFO.frequency.value =
          this.audioEngine.effects.flangerRate;
      }
    });

    this.setupSlider("flanger-depth", (value) => {
      this.audioEngine.effects.flangerDepth = parseFloat(value) / 100;
      if (this.audioEngine.flangerWet && this.audioEngine.flangerDry) {
        this.audioEngine.flangerWet.gain.value =
          this.audioEngine.effects.flangerDepth;
        this.audioEngine.flangerLFOGain.gain.value =
          0.002 + this.audioEngine.effects.flangerDepth * 0.003;
      }
    });

    this.setupSlider("flanger-feedback", (value) => {
      this.audioEngine.effects.flangerFeedbackAmount = parseFloat(value) / 100;
      if (this.audioEngine.flangerFeedback) {
        this.audioEngine.flangerFeedback.gain.value =
          this.audioEngine.effects.flangerFeedbackAmount;
      }
    });

    this.setupSlider("delay-time", (value) => {
      this.audioEngine.effects.delayTime = parseFloat(value);
      if (this.audioEngine.delayNode) {
        this.audioEngine.delayNode.delayTime.value =
          this.audioEngine.effects.delayTime;
      }
    });

    this.setupSlider("delay-feedback", (value) => {
      this.audioEngine.effects.delayFeedback = parseFloat(value) / 100;
      if (this.audioEngine.delayFeedback) {
        this.audioEngine.delayFeedback.gain.value =
          this.audioEngine.effects.delayFeedback;
      }
    });

    this.setupSlider("delay-mix", (value) => {
      this.audioEngine.effects.delayMix = parseFloat(value) / 100;
      if (this.audioEngine.delayWet) {
        this.audioEngine.delayWet.gain.value =
          this.audioEngine.effects.delayMix;
      }
    });

    this.setupSlider("reverb-mix", (value) => {
      this.audioEngine.effects.reverbMix = parseFloat(value) / 100;
      if (this.audioEngine.reverbWet) {
        this.audioEngine.reverbWet.gain.value =
          this.audioEngine.effects.reverbMix;
      }
    });

    this.setupSlider("master-volume", (value) => {
      this.audioEngine.setMasterVolume(value / 100);
    });

    // Limiter controls
    this.setupSlider("limiter-gain", (value) => {
      const gainDb = parseFloat(value);
      this.audioEngine.setLimiterGain(gainDb);
      document.getElementById(
        "limiter-gain-value"
      ).textContent = `${gainDb.toFixed(2)} dB`;
    });

    this.setupSlider("limiter-ceiling", (value) => {
      const ceilingDb = parseFloat(value);
      this.audioEngine.setLimiterCeiling(ceilingDb);
      document.getElementById(
        "limiter-ceiling-value"
      ).textContent = `${ceilingDb.toFixed(2)} dB`;
    });

    this.setupSlider("limiter-lookahead", (value) => {
      const lookaheadMs = parseFloat(value);
      this.audioEngine.setLimiterLookahead(lookaheadMs);
      document.getElementById(
        "limiter-lookahead-value"
      ).textContent = `${lookaheadMs.toFixed(2)} ms`;
    });

    this.setupSlider("limiter-release", (value) => {
      const releaseMs = parseFloat(value);
      this.audioEngine.setLimiterRelease(releaseMs);
      document.getElementById(
        "limiter-release-value"
      ).textContent = `${releaseMs} ms`;
    });
  }

  setupControl(id, callback) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("change", (e) => callback(e.target.value));
    }
  }

  setupSlider(id, callback) {
    const slider = document.getElementById(id);
    const valueDisplay = document.getElementById(`${id}-value`);
    if (slider) {
      slider.addEventListener("input", (e) => {
        const value = e.target.value;
        if (valueDisplay) {
          valueDisplay.textContent = value;
        }
        callback(value);
      });
    }
  }

  setupKeyboard() {
    const keys = document.querySelectorAll(".key");

    // Mouse/touch events
    keys.forEach((key) => {
      const note = key.dataset.note;
      const octaveOffset = parseInt(key.dataset.octaveOffset || 0);
      const noteId = `${note}_${octaveOffset}`;

      key.addEventListener("mousedown", () =>
        this.voiceManager.playNote(note, key, octaveOffset)
      );
      key.addEventListener("mouseup", () =>
        this.voiceManager.stopNote(noteId, key)
      );
      key.addEventListener("mouseleave", () =>
        this.voiceManager.stopNote(noteId, key)
      );

      key.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.voiceManager.playNote(note, key, octaveOffset);
      });
      key.addEventListener("touchend", (e) => {
        e.preventDefault();
        this.voiceManager.stopNote(noteId, key);
      });
    });

    // Keyboard events
    const keyMap = new Map();
    keys.forEach((key) => {
      const note = key.dataset.note;
      const octaveOffset = parseInt(key.dataset.octaveOffset || 0);
      keyMap.set(key.dataset.key.toLowerCase(), {
        note,
        octaveOffset,
        noteId: `${note}_${octaveOffset}`,
        element: key,
      });
    });

    const pressedKeys = new Set();

    document.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (keyMap.has(key) && !pressedKeys.has(key)) {
        pressedKeys.add(key);
        const { note, octaveOffset, noteId, element } = keyMap.get(key);
        this.voiceManager.playNote(note, element, octaveOffset);
      }
    });

    document.addEventListener("keyup", (e) => {
      const key = e.key.toLowerCase();
      if (keyMap.has(key)) {
        pressedKeys.delete(key);
        const { noteId, element } = keyMap.get(key);
        this.voiceManager.stopNote(noteId, element);
      }
    });

    // Stop all keyboard notes when window loses focus
    window.addEventListener("blur", () => {
      pressedKeys.forEach((key) => {
        if (keyMap.has(key)) {
          const { noteId, element } = keyMap.get(key);
          this.voiceManager.stopNote(noteId, element);
        }
      });
      pressedKeys.clear();
    });
  }
}
