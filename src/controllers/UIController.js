// UI Controller - Handles user interface interactions

export class UIController {
  constructor(voiceManager, audioEngine) {
    this.voiceManager = voiceManager;
    this.audioEngine = audioEngine;
  }

  setupControls() {
    // Setup knob controls first
    this.setupKnobs();

    // Oscillator wave selectors (dropdowns)
    this.setupControl(
      "osc1-wave",
      (value) => (this.voiceManager.osc1.wave = value)
    );
    this.setupControl(
      "osc2-wave",
      (value) => (this.voiceManager.osc2.wave = value)
    );

    // Filter type control (still using select dropdown)
    this.setupControl(
      "filter-type",
      (value) => (this.voiceManager.filter.type = value)
    );

    // LFO wave selector (dropdown)
    this.setupControl(
      "lfo-wave",
      (value) => (this.voiceManager.lfo.wave = value)
    );

    // Master volume (still using slider)
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

  setupKnobs() {
    const knobs = document.querySelectorAll(".knob");

    knobs.forEach((knobSvg) => {
      const id = knobSvg.dataset.id;
      const min = parseFloat(knobSvg.dataset.min);
      const max = parseFloat(knobSvg.dataset.max);
      const initialValue = parseFloat(knobSvg.dataset.value);
      const step = parseFloat(knobSvg.dataset.step) || 1;

      let currentValue = initialValue;
      let isDragging = false;
      let startY = 0;
      let startValue = 0;

      const handle = knobSvg.querySelector(".knob-handle");
      const fill = knobSvg.querySelector(".knob-fill");
      const display = document.getElementById(`${id}-display`);

      const updateKnob = (value) => {
        currentValue = Math.max(min, Math.min(max, value));

        // Calculate rotation angle (-135 to +135 degrees)
        const percent = (currentValue - min) / (max - min);
        const angle = -135 + percent * 270;

        // Update handle position
        const rad = ((angle - 90) * Math.PI) / 180;
        const cx = 50 + 40 * Math.cos(rad);
        const cy = 50 + 40 * Math.sin(rad);
        handle.setAttribute("cx", cx);
        handle.setAttribute("cy", cy);

        // Update fill arc
        const startAngle = -135;
        const endAngle = angle;
        const startRad = ((startAngle - 90) * Math.PI) / 180;
        const endRad = ((endAngle - 90) * Math.PI) / 180;
        const startX = 50 + 40 * Math.cos(startRad);
        const startY = 50 + 40 * Math.sin(startRad);
        const endX = 50 + 40 * Math.cos(endRad);
        const endY = 50 + 40 * Math.sin(endRad);
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        const path = `M ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY}`;
        fill.setAttribute("d", path);

        // Update display
        this.updateKnobDisplay(id, currentValue, display);

        // Update audio parameter
        this.updateKnobParameter(id, currentValue);
      };

      const handleMouseDown = (e) => {
        isDragging = true;
        startY = e.clientY || e.touches[0].clientY;
        startValue = currentValue;
        e.preventDefault();
      };

      const handleMouseMove = (e) => {
        if (!isDragging) return;

        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        const deltaY = startY - clientY;
        const range = max - min;
        const sensitivity = range / 200; // 200px mouse movement for full range
        const newValue = startValue + deltaY * sensitivity;

        // Apply step rounding
        const steppedValue = Math.round(newValue / step) * step;
        updateKnob(steppedValue);
      };

      const handleMouseUp = () => {
        isDragging = false;
      };

      // Mouse events
      knobSvg.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      // Touch events
      knobSvg.addEventListener("touchstart", handleMouseDown);
      document.addEventListener("touchmove", handleMouseMove);
      document.addEventListener("touchend", handleMouseUp);

      // Initialize knob position
      updateKnob(currentValue);
    });
  }

  updateKnobDisplay(id, value, displayElement) {
    let displayText = "";

    switch (id) {
      // Oscillator controls
      case "osc1-detune":
      case "osc2-detune":
        displayText = Math.round(value).toString();
        break;
      case "osc1-level":
      case "osc2-level":
      case "noise-level":
        displayText = Math.round(value) + "%";
        break;
      case "octave":
        displayText = Math.round(value).toString();
        break;
      // ADSR controls
      case "attack":
      case "decay":
      case "release":
        displayText = value.toFixed(2) + "s";
        break;
      case "sustain":
        displayText = value.toFixed(2);
        break;
      // LFO controls
      case "lfo-rate":
        displayText = value.toFixed(1);
        break;
      case "lfo-pitch-depth":
      case "lfo-filter-depth":
        displayText = Math.round(value).toString();
        break;
      case "lfo-amp-depth":
        displayText = Math.round(value) + "%";
        break;
      // Filter controls
      case "filter-cutoff":
        displayText = Math.round(value) + "Hz";
        break;
      case "filter-resonance":
        displayText = value.toFixed(1);
        break;
      case "filter-env-amount":
        displayText = Math.round(value).toString();
        break;
      case "filter-attack":
      case "filter-decay":
        displayText = value.toFixed(2) + "s";
        break;
      // Effects controls
      case "distortion-drive":
        displayText = Math.round(value).toString();
        break;
      case "chorus-rate":
      case "flanger-rate":
        displayText = value.toFixed(1);
        break;
      case "chorus-depth":
      case "flanger-depth":
      case "flanger-feedback":
      case "delay-feedback":
      case "delay-mix":
      case "reverb-mix":
        displayText = Math.round(value) + "%";
        break;
      case "delay-time":
        displayText = value.toFixed(2) + "s";
        break;
      default:
        displayText = value.toString();
    }

    displayElement.textContent = displayText;
  }

  updateKnobParameter(id, value) {
    switch (id) {
      // Oscillator parameters
      case "osc1-detune":
        this.voiceManager.osc1.detune = value;
        break;
      case "osc1-level":
        this.voiceManager.osc1.level = value / 100;
        break;
      case "osc2-detune":
        this.voiceManager.osc2.detune = value;
        break;
      case "osc2-level":
        this.voiceManager.osc2.level = value / 100;
        break;
      case "noise-level":
        this.voiceManager.noiseLevel = value / 100;
        break;
      case "octave":
        this.voiceManager.octave = Math.round(value);
        break;
      // ADSR parameters
      case "attack":
        this.voiceManager.ampEnv.attack = value;
        break;
      case "decay":
        this.voiceManager.ampEnv.decay = value;
        break;
      case "sustain":
        this.voiceManager.ampEnv.sustain = value;
        break;
      case "release":
        this.voiceManager.ampEnv.release = value;
        break;
      // LFO parameters
      case "lfo-rate":
        this.voiceManager.lfo.rate = value;
        break;
      case "lfo-pitch-depth":
        this.voiceManager.lfo.pitchDepth = value;
        break;
      case "lfo-filter-depth":
        this.voiceManager.lfo.filterDepth = value;
        break;
      case "lfo-amp-depth":
        this.voiceManager.lfo.ampDepth = value / 100;
        break;
      // Filter parameters
      case "filter-cutoff":
        this.voiceManager.filter.cutoff = value;
        break;
      case "filter-resonance":
        this.voiceManager.filter.resonance = value;
        break;
      case "filter-env-amount":
        this.voiceManager.filter.envAmount = value;
        break;
      case "filter-attack":
        this.voiceManager.filter.attack = value;
        break;
      case "filter-decay":
        this.voiceManager.filter.decay = value;
        break;
      // Effects parameters
      case "distortion-drive":
        this.audioEngine.effects.distortionDrive = value;
        if (this.audioEngine.distortion) {
          this.audioEngine.updateDistortionCurve(value);
        }
        break;
      case "chorus-rate":
        this.audioEngine.effects.chorusRate = value;
        if (this.audioEngine.chorusLFO) {
          this.audioEngine.chorusLFO.frequency.value = value;
        }
        break;
      case "chorus-depth":
        this.audioEngine.effects.chorusDepth = value / 100;
        if (this.audioEngine.chorusWet) {
          this.audioEngine.chorusWet.gain.value = value / 100;
        }
        break;
      case "flanger-rate":
        this.audioEngine.effects.flangerRate = value;
        if (this.audioEngine.flangerLFO) {
          this.audioEngine.flangerLFO.frequency.value = value;
        }
        break;
      case "flanger-depth":
        this.audioEngine.effects.flangerDepth = value / 100;
        if (this.audioEngine.flangerWet) {
          this.audioEngine.flangerWet.gain.value = value / 100;
          this.audioEngine.flangerLFOGain.gain.value =
            0.002 + (value / 100) * 0.003;
        }
        break;
      case "flanger-feedback":
        this.audioEngine.effects.flangerFeedbackAmount = value / 100;
        if (this.audioEngine.flangerFeedback) {
          this.audioEngine.flangerFeedback.gain.value = value / 100;
        }
        break;
      case "delay-time":
        this.audioEngine.effects.delayTime = value;
        if (this.audioEngine.delayNode) {
          this.audioEngine.delayNode.delayTime.value = value;
        }
        break;
      case "delay-feedback":
        this.audioEngine.effects.delayFeedback = value / 100;
        if (this.audioEngine.delayFeedback) {
          this.audioEngine.delayFeedback.gain.value = value / 100;
        }
        break;
      case "delay-mix":
        this.audioEngine.effects.delayMix = value / 100;
        if (this.audioEngine.delayWet) {
          this.audioEngine.delayWet.gain.value = value / 100;
        }
        break;
      case "reverb-mix":
        this.audioEngine.effects.reverbMix = value / 100;
        if (this.audioEngine.reverbWet) {
          this.audioEngine.reverbWet.gain.value = value / 100;
        }
        break;
    }
  }
}
