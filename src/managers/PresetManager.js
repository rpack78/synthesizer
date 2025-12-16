// Preset Manager - Handles saving, loading, and managing presets

import { getPresetData } from "../data/presets.js";
import { showMessage } from "../utils/utils.js";

export class PresetManager {
  constructor(voiceManager, audioEngine) {
    this.voiceManager = voiceManager;
    this.audioEngine = audioEngine;
    this.presets = this.initializePresets();
    this.customPresets = this.loadCustomPresets();
  }

  initializePresets() {
    return getPresetData();
  }

  loadCustomPresets() {
    const stored = localStorage.getItem("synthCustomPresets");
    return stored ? JSON.parse(stored) : [];
  }

  saveCustomPresetsToStorage() {
    localStorage.setItem(
      "synthCustomPresets",
      JSON.stringify(this.customPresets)
    );
  }

  setupControls() {
    const categorySelect = document.getElementById("preset-category");
    const presetList = document.getElementById("preset-list");
    const loadBtn = document.getElementById("load-preset");
    const saveBtn = document.getElementById("save-preset");
    const deleteBtn = document.getElementById("delete-preset");
    const presetName = document.getElementById("preset-name");

    // Update preset list when category changes
    categorySelect.addEventListener("change", () => {
      this.updatePresetList();
    });

    // Load preset
    loadBtn.addEventListener("click", () => {
      const category = categorySelect.value;
      const index = parseInt(presetList.value);

      let preset;
      if (category === "custom") {
        preset = this.customPresets[index];
      } else {
        preset = this.presets[category][index];
      }

      if (preset) {
        this.loadPreset(preset);
        showMessage(`Loaded: ${preset.name}`, "success");
      }
    });

    // Save custom preset
    saveBtn.addEventListener("click", () => {
      const name = presetName.value.trim();
      if (!name) {
        showMessage("Please enter a preset name", "error");
        return;
      }

      const preset = this.getCurrentSettings();
      preset.name = name;

      this.customPresets.push(preset);
      this.saveCustomPresetsToStorage();

      // Switch to custom category and update list
      categorySelect.value = "custom";
      this.updatePresetList();
      presetList.value = this.customPresets.length - 1;

      showMessage(`Saved: ${name}`, "success");
      presetName.value = "";
    });

    // Delete custom preset
    deleteBtn.addEventListener("click", () => {
      if (categorySelect.value !== "custom") {
        showMessage("Can only delete custom presets", "error");
        return;
      }

      const index = parseInt(presetList.value);
      if (index >= 0 && index < this.customPresets.length) {
        const name = this.customPresets[index].name;
        this.customPresets.splice(index, 1);
        this.saveCustomPresetsToStorage();
        this.updatePresetList();
        showMessage(`Deleted: ${name}`, "success");
      }
    });

    // Initialize preset list
    this.updatePresetList();
  }

  updatePresetList() {
    const categorySelect = document.getElementById("preset-category");
    const presetList = document.getElementById("preset-list");
    const category = categorySelect.value;

    presetList.innerHTML = "";

    let presets;
    if (category === "custom") {
      presets = this.customPresets;
    } else {
      presets = this.presets[category];
    }

    presets.forEach((preset, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = preset.name;
      presetList.appendChild(option);
    });

    // Show/hide delete button
    const deleteBtn = document.getElementById("delete-preset");
    deleteBtn.style.display =
      category === "custom" && presets.length > 0 ? "block" : "none";
  }

  getCurrentSettings() {
    return {
      osc1: {
        wave: this.voiceManager.osc1.wave,
        detune: this.voiceManager.osc1.detune,
        level: this.voiceManager.osc1.level * 100,
      },
      osc2: {
        wave: this.voiceManager.osc2.wave,
        detune: this.voiceManager.osc2.detune,
        level: this.voiceManager.osc2.level * 100,
      },
      noiseLevel: this.voiceManager.noiseLevel * 100,
      octave: this.voiceManager.octave,
      filter: { ...this.voiceManager.filter },
      ampEnv: { ...this.voiceManager.ampEnv },
      lfo: {
        wave: this.voiceManager.lfo.wave,
        rate: this.voiceManager.lfo.rate,
        pitchDepth: this.voiceManager.lfo.pitchDepth,
        filterDepth: this.voiceManager.lfo.filterDepth,
        ampDepth: this.voiceManager.lfo.ampDepth * 100,
      },
      effects: {
        delayTime: this.audioEngine.effects.delayTime,
        delayFeedback: this.audioEngine.effects.delayFeedback * 100,
        delayMix: this.audioEngine.effects.delayMix * 100,
        reverbMix: this.audioEngine.effects.reverbMix * 100,
        distortionDrive: this.audioEngine.effects.distortionDrive,
        chorusRate: this.audioEngine.effects.chorusRate,
        chorusDepth: this.audioEngine.effects.chorusDepth * 100,
        flangerRate: this.audioEngine.effects.flangerRate,
        flangerDepth: this.audioEngine.effects.flangerDepth * 100,
        flangerFeedbackAmount:
          this.audioEngine.effects.flangerFeedbackAmount * 100,
      },
      masterVolume: this.audioEngine.masterVolume * 100,
      maxVolume: this.audioEngine.maxVolume * 100,
    };
  }

  loadPreset(preset) {
    // Update voice manager parameters
    this.voiceManager.osc1 = {
      wave: preset.osc1.wave,
      detune: preset.osc1.detune,
      level: preset.osc1.level / 100,
    };
    this.voiceManager.osc2 = {
      wave: preset.osc2.wave,
      detune: preset.osc2.detune,
      level: preset.osc2.level / 100,
    };
    this.voiceManager.noiseLevel = preset.noiseLevel / 100;
    this.voiceManager.octave = preset.octave;
    this.voiceManager.filter = { ...preset.filter };
    this.voiceManager.ampEnv = { ...preset.ampEnv };
    this.voiceManager.lfo = {
      wave: preset.lfo.wave,
      rate: preset.lfo.rate,
      pitchDepth: preset.lfo.pitchDepth,
      filterDepth: preset.lfo.filterDepth,
      ampDepth: preset.lfo.ampDepth / 100,
    };

    // Update audio engine parameters
    this.audioEngine.effects = {
      delayTime: preset.effects.delayTime,
      delayFeedback: preset.effects.delayFeedback / 100,
      delayMix: preset.effects.delayMix / 100,
      reverbMix: preset.effects.reverbMix / 100,
      distortionDrive: preset.effects.distortionDrive || 0,
      chorusRate: preset.effects.chorusRate || 0.5,
      chorusDepth: (preset.effects.chorusDepth || 0) / 100,
      flangerRate: preset.effects.flangerRate || 0.3,
      flangerDepth: (preset.effects.flangerDepth || 0) / 100,
      flangerFeedbackAmount: (preset.effects.flangerFeedbackAmount || 50) / 100,
    };
    this.audioEngine.masterVolume = preset.masterVolume / 100;
    this.audioEngine.maxVolume = (preset.maxVolume || 100) / 100;

    // Update audio nodes if initialized
    if (this.audioEngine.audioContext) {
      this.audioEngine.delayNode.delayTime.value =
        this.audioEngine.effects.delayTime;
      this.audioEngine.delayFeedback.gain.value =
        this.audioEngine.effects.delayFeedback;
      this.audioEngine.delayWet.gain.value = this.audioEngine.effects.delayMix;
      this.audioEngine.reverbWet.gain.value =
        this.audioEngine.effects.reverbMix;
      this.audioEngine.masterGain.gain.value = this.audioEngine.masterVolume;
      this.audioEngine.limiterGain.gain.value = this.audioEngine.maxVolume;
    }

    // Update UI
    this.updateUIFromSettings();
  }

  updateUIFromSettings() {
    // Oscillator 1
    this.updateUIControl("osc1-wave", this.voiceManager.osc1.wave);
    this.updateUISlider("osc1-detune", this.voiceManager.osc1.detune);
    this.updateUISlider("osc1-level", this.voiceManager.osc1.level * 100);

    // Oscillator 2
    this.updateUIControl("osc2-wave", this.voiceManager.osc2.wave);
    this.updateUISlider("osc2-detune", this.voiceManager.osc2.detune);
    this.updateUISlider("osc2-level", this.voiceManager.osc2.level * 100);

    // Noise
    this.updateUISlider("noise-level", this.voiceManager.noiseLevel * 100);

    // Octave
    this.updateUISlider("octave", this.voiceManager.octave);

    // Filter
    this.updateUIControl("filter-type", this.voiceManager.filter.type);
    this.updateUISlider("filter-cutoff", this.voiceManager.filter.cutoff);
    this.updateUISlider("filter-resonance", this.voiceManager.filter.resonance);
    this.updateUISlider(
      "filter-env-amount",
      this.voiceManager.filter.envAmount
    );
    this.updateUISlider("filter-attack", this.voiceManager.filter.attack);
    this.updateUISlider("filter-decay", this.voiceManager.filter.decay);

    // Amplitude Envelope
    this.updateUISlider("attack", this.voiceManager.ampEnv.attack);
    this.updateUISlider("decay", this.voiceManager.ampEnv.decay);
    this.updateUISlider("sustain", this.voiceManager.ampEnv.sustain);
    this.updateUISlider("release", this.voiceManager.ampEnv.release);

    // LFO
    this.updateUIControl("lfo-wave", this.voiceManager.lfo.wave);
    this.updateUISlider("lfo-rate", this.voiceManager.lfo.rate);
    this.updateUISlider("lfo-pitch-depth", this.voiceManager.lfo.pitchDepth);
    this.updateUISlider("lfo-filter-depth", this.voiceManager.lfo.filterDepth);
    this.updateUISlider("lfo-amp-depth", this.voiceManager.lfo.ampDepth * 100);

    // Effects
    this.updateUISlider(
      "distortion-drive",
      this.audioEngine.effects.distortionDrive
    );
    this.updateUISlider("chorus-rate", this.audioEngine.effects.chorusRate);
    this.updateUISlider(
      "chorus-depth",
      this.audioEngine.effects.chorusDepth * 100
    );
    this.updateUISlider("flanger-rate", this.audioEngine.effects.flangerRate);
    this.updateUISlider(
      "flanger-depth",
      this.audioEngine.effects.flangerDepth * 100
    );
    this.updateUISlider(
      "flanger-feedback",
      this.audioEngine.effects.flangerFeedbackAmount * 100
    );
    this.updateUISlider("delay-time", this.audioEngine.effects.delayTime);
    this.updateUISlider(
      "delay-feedback",
      this.audioEngine.effects.delayFeedback * 100
    );
    this.updateUISlider("delay-mix", this.audioEngine.effects.delayMix * 100);
    this.updateUISlider("reverb-mix", this.audioEngine.effects.reverbMix * 100);
    this.updateUISlider("master-volume", this.audioEngine.masterVolume * 100);
    this.updateUISlider("max-volume", this.audioEngine.maxVolume * 100);
  }

  updateUIControl(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.value = value;
    }
  }

  updateUISlider(id, value) {
    const slider = document.getElementById(id);
    const valueDisplay = document.getElementById(`${id}-value`);
    if (slider && valueDisplay) {
      slider.value = value;
      valueDisplay.textContent = value;
    }
  }
}
